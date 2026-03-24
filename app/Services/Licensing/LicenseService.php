<?php

namespace App\Services\Licensing;

use App\Models\License;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class LicenseService
{
    public function __construct(
        protected RemoteLicenseClient $remoteLicenseClient
    ) {
    }

    public function hasLicenseTable(): bool
    {
        return Schema::hasTable('licenses');
    }

    public function current(): ?License
    {
        if (! $this->hasLicenseTable()) {
            return null;
        }

        return License::query()->latest('id')->first();
    }

    public function getOrCreateCurrent(): License
    {
        $license = $this->current();

        if ($license) {
            return $license;
        }

        return License::query()->create([
            'status' => License::STATUS_NOT_ACTIVATED,
            'features' => [],
            'meta' => [
                'country' => config('license.default_country', 'BD'),
                'currency' => config('license.default_currency', 'BDT'),
                'payment_method' => 'bKash',
            ],
        ]);
    }

    public function activate(string $licenseKey, ?string $email = null): License
    {
        $licenseKey = trim($licenseKey);

        if ($licenseKey === '') {
            throw new RuntimeException('License key is required.');
        }

        $license = $this->getOrCreateCurrent();
        $payload = $this->remoteLicenseClient->activate([
            'license_key' => $licenseKey,
            'licensed_email' => $email,
            'app_url' => URL::to('/'),
            'machine_fingerprint' => $this->machineFingerprint(),
        ]);

        return $this->applyRemoteState($license, $payload, $licenseKey, $email);
    }

    public function refresh(bool $strict = true): ?License
    {
        $license = $this->current();

        if (! $license || ! $license->license_key) {
            return $license;
        }

        try {
            $payload = $this->remoteLicenseClient->validate([
                'license_key' => $license->license_key,
                'app_url' => URL::to('/'),
                'machine_fingerprint' => $this->machineFingerprint(),
            ]);

            return $this->applyRemoteState($license, $payload, $license->license_key, $license->licensed_email);
        } catch (\Throwable $exception) {
            $license->forceFill([
                'last_validation_error' => $exception->getMessage(),
            ])->save();

            if ($strict) {
                throw $exception;
            }

            return $license->fresh();
        }
    }

    public function deactivate(): License
    {
        $license = $this->getOrCreateCurrent();

        $license->forceFill([
            'license_key' => null,
            'licensed_email' => null,
            'plan' => null,
            'status' => License::STATUS_NOT_ACTIVATED,
            'activated_at' => null,
            'last_validated_at' => null,
            'expires_at' => null,
            'last_validation_error' => null,
            'features' => [],
            'payload_signature' => null,
            'payload_data' => null,
        ])->save();

        return $license->fresh();
    }

    public function shouldRefresh(?License $license = null): bool
    {
        $license ??= $this->current();

        if (! $license || ! $license->license_key || ! $license->last_validated_at) {
            return true;
        }

        return $license->last_validated_at->diffInHours(now()) >= (int) config('license.activation_refresh_hours', 12);
    }

    public function evaluateFeatureAccess(string $feature): array
    {
        $license = $this->current();

        if (! $license || ! $license->license_key || $license->status === License::STATUS_NOT_ACTIVATED) {
            return [
                'allowed' => false,
                'reason' => 'activation_required',
                'message' => 'Activate a plan first to use this feature.',
                'required_plan' => $this->requiredPlanForFeature($feature),
                'current_plan' => null,
            ];
        }

        if (! $license->isActive()) {
            return [
                'allowed' => false,
                'reason' => 'invalid_license',
                'message' => 'Your license is not valid right now. Please refresh or reactivate your plan.',
                'required_plan' => $this->requiredPlanForFeature($feature),
                'current_plan' => $license->plan,
            ];
        }

        $requiredPlan = $this->requiredPlanForFeature($feature);
        $currentRank = $this->planRank($license->plan);
        $requiredRank = $this->planRank($requiredPlan);

        if ($currentRank < $requiredRank) {
            return [
                'allowed' => false,
                'reason' => 'upgrade_required',
                'message' => sprintf(
                    'Your current %s plan does not include %s. Upgrade to %s to continue.',
                    $this->planLabel($license->plan),
                    $this->featureLabel($feature),
                    $this->planLabel($requiredPlan)
                ),
                'required_plan' => $requiredPlan,
                'current_plan' => $license->plan,
            ];
        }

        return [
            'allowed' => true,
            'reason' => null,
            'message' => null,
            'required_plan' => $requiredPlan,
            'current_plan' => $license->plan,
        ];
    }

    public function requiredPlanForFeature(string $feature): string
    {
        return config("license.features.{$feature}", 'basic');
    }

    public function featureLabel(string $feature): string
    {
        return config("license.feature_labels.{$feature}", ucfirst(str_replace('_', ' ', $feature)));
    }

    public function planLabel(?string $plan): string
    {
        if (! $plan) {
            return 'No plan';
        }

        return config("license.plans.{$plan}.label", ucfirst($plan));
    }

    public function planRank(?string $plan): int
    {
        if (! $plan) {
            return 0;
        }

        return (int) config("license.plans.{$plan}.rank", 0);
    }

    public function planCatalog(): array
    {
        $features = collect(config('license.features', []));
        $labels = config('license.feature_labels', []);

        return collect(config('license.plans', []))
            ->map(function (array $plan, string $planKey) use ($features, $labels) {
                $exclusiveFeatures = $features
                    ->filter(fn (string $minimumPlan) => $minimumPlan === $planKey)
                    ->keys()
                    ->map(fn (string $featureKey) => [
                        'key' => $featureKey,
                        'label' => $labels[$featureKey] ?? ucfirst(str_replace('_', ' ', $featureKey)),
                        'minimum_plan' => $this->requiredPlanForFeature($featureKey),
                    ])
                    ->values()
                    ->all();

                $includedFeatures = $features
                    ->filter(fn (string $minimumPlan) => $this->planRank($planKey) >= $this->planRank($minimumPlan))
                    ->keys()
                    ->map(fn (string $featureKey) => [
                        'key' => $featureKey,
                        'label' => $labels[$featureKey] ?? ucfirst(str_replace('_', ' ', $featureKey)),
                        'minimum_plan' => $this->requiredPlanForFeature($featureKey),
                    ])
                    ->values()
                    ->all();

                return [
                    'key' => $planKey,
                    'label' => $plan['label'] ?? ucfirst($planKey),
                    // Dummy pricing until the licensing server becomes the source of truth.
                    'price_bdt' => $plan['price_bdt'] ?? null,
                    'price_label' => $plan['price_label'] ?? null,
                    'rank' => $plan['rank'] ?? 0,
                    'payment_method' => 'bKash',
                    'inherits_from' => collect(config('license.plans', []))
                        ->keys()
                        ->filter(fn (string $candidatePlan) => $this->planRank($candidatePlan) < $this->planRank($planKey))
                        ->values()
                        ->all(),
                    'highlights' => count($exclusiveFeatures) ? $exclusiveFeatures : $includedFeatures,
                    'included_features' => $includedFeatures,
                ];
            })
            ->values()
            ->all();
    }

    public function frontendState(): array
    {
        $license = $this->current();

        return [
            'status' => $license?->status ?? License::STATUS_NOT_ACTIVATED,
            'status_label' => $this->statusLabel($license?->status),
            'plan' => $license?->plan,
            'plan_label' => $this->planLabel($license?->plan),
            'is_active' => (bool) $license?->isActive(),
            'requires_activation' => ! $license || ! $license->license_key || $license->status === License::STATUS_NOT_ACTIVATED,
            'licensed_email' => $license?->licensed_email,
            'license_key_masked' => $license?->license_key ? $this->maskLicenseKey($license->license_key) : null,
            'expires_at' => $license?->expires_at?->toDateTimeString(),
            'last_validated_at' => $license?->last_validated_at?->toDateTimeString(),
            'last_validation_error' => $license?->last_validation_error,
            'features' => $license?->features ?? [],
        ];
    }

    protected function applyRemoteState(
        License $license,
        array $payload,
        string $licenseKey,
        ?string $email = null
    ): License {
        $plan = Arr::get($payload, 'plan');
        $status = $this->normalizeStatus((string) Arr::get($payload, 'status', License::STATUS_INVALID));
        $features = Arr::get($payload, 'features');

        $license->forceFill([
            'license_key' => $licenseKey,
            'licensed_email' => Arr::get($payload, 'licensed_email', $email),
            'plan' => $plan,
            'status' => $status,
            'machine_fingerprint' => Arr::get($payload, 'machine_fingerprint', $this->machineFingerprint()),
            'activated_at' => $status === License::STATUS_ACTIVE
                ? ($license->activated_at ?? now())
                : null,
            'last_validated_at' => now(),
            'expires_at' => $this->normalizeDate(Arr::get($payload, 'expires_at')),
            'last_validation_error' => null,
            'features' => is_array($features) ? $features : $this->featuresForPlan($plan),
            'meta' => array_filter([
                'country' => Arr::get($payload, 'country', config('license.default_country')),
                'currency' => Arr::get($payload, 'currency', config('license.default_currency')),
                'payment_method' => Arr::get($payload, 'payment_method', 'bKash'),
                'plan_label' => $this->planLabel($plan),
            ], fn ($value) => $value !== null && $value !== ''),
            'payload_signature' => Arr::get($payload, '_signature'),
            'payload_data' => Arr::except($payload, ['_signature']),
        ])->save();

        return $license->fresh();
    }

    protected function normalizeStatus(string $status): string
    {
        return match ($status) {
            License::STATUS_ACTIVE,
            License::STATUS_EXPIRED,
            License::STATUS_INVALID,
            License::STATUS_SUSPENDED,
            License::STATUS_NOT_ACTIVATED => $status,
            default => License::STATUS_INVALID,
        };
    }

    protected function statusLabel(?string $status): string
    {
        return match ($status) {
            License::STATUS_ACTIVE => 'Active',
            License::STATUS_EXPIRED => 'Expired',
            License::STATUS_INVALID => 'Invalid',
            License::STATUS_SUSPENDED => 'Suspended',
            default => 'Not Activated',
        };
    }

    protected function featuresForPlan(?string $plan): array
    {
        return collect(config('license.features', []))
            ->filter(fn (string $minimumPlan) => $this->planRank($plan) >= $this->planRank($minimumPlan))
            ->keys()
            ->values()
            ->all();
    }

    protected function machineFingerprint(): string
    {
        $seed = implode('|', [
            URL::to('/'),
            config('app.name'),
            config('database.default'),
            config('database.connections.' . config('database.default') . '.database'),
        ]);

        return hash('sha256', $seed);
    }

    protected function normalizeDate(mixed $value): ?CarbonInterface
    {
        if (! $value) {
            return null;
        }

        return Carbon::parse($value);
    }

    protected function maskLicenseKey(string $licenseKey): string
    {
        $clean = preg_replace('/\s+/', '', $licenseKey) ?: $licenseKey;
        $length = strlen($clean);

        if ($length <= 8) {
            return str_repeat('*', max($length - 4, 0)) . substr($clean, -4);
        }

        return substr($clean, 0, 4) . str_repeat('*', max($length - 8, 0)) . substr($clean, -4);
    }
}
