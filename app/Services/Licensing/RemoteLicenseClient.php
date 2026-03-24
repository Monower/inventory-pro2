<?php

namespace App\Services\Licensing;

use App\Models\License;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class RemoteLicenseClient
{
    /**
     * @throws ConnectionException
     * @throws RequestException
     */
    public function activate(array $payload): array
    {
        return $this->send('/api/licenses/activate', $payload);
    }

    /**
     * @throws ConnectionException
     * @throws RequestException
     */
    public function validate(array $payload): array
    {
        return $this->send('/api/licenses/validate', $payload);
    }

    /**
     * @throws ConnectionException
     * @throws RequestException
     */
    protected function send(string $path, array $payload): array
    {
        $baseUrl = rtrim((string) config('services.license.base_url'), '/');

        if ($baseUrl === '') {
            return $this->resolveDummyPayload($payload);
        }

        $response = Http::acceptJson()
            ->asJson()
            ->timeout((int) config('license.timeout_seconds', 10))
            ->withHeaders(array_filter([
                'X-License-App-Id' => config('services.license.app_id'),
                'X-License-App-Key' => config('services.license.app_key'),
            ]))
            ->post($baseUrl . $path, $payload)
            ->throw();

        $json = $response->json();
        $data = is_array($json) ? ($json['data'] ?? $json) : [];

        if (! is_array($data)) {
            throw new RuntimeException('License server returned an unexpected response.');
        }

        $payloadData = Arr::get($data, 'payload', $data);

        if (is_string($payloadData)) {
            $decodedPayload = json_decode($payloadData, true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decodedPayload)) {
                $payloadData = $decodedPayload;
            }
        }

        if (! is_array($payloadData)) {
            throw new RuntimeException('License payload is not readable.');
        }

        $signature = Arr::get($data, 'signature');
        $publicKey = trim((string) config('services.license.public_key'));

        if ($publicKey !== '' && $signature) {
            $verified = openssl_verify(
                json_encode($payloadData, JSON_UNESCAPED_SLASHES),
                base64_decode((string) $signature, true) ?: '',
                $publicKey,
                OPENSSL_ALGO_SHA256
            );

            if ($verified !== 1) {
                throw new RuntimeException('License server signature verification failed.');
            }
        }

        $payloadData['_signature'] = $signature;

        return $payloadData;
    }

    protected function resolveDummyPayload(array $payload): array
    {
        if (! config('license.dummy_mode', true)) {
            throw new RuntimeException('License server base URL is not configured.');
        }

        $licenseKey = trim((string) Arr::get($payload, 'license_key'));
        $dummyLicense = $this->dummyLicenses()->get($licenseKey);

        if (! $dummyLicense) {
            return [
                'status' => License::STATUS_INVALID,
                'plan' => null,
                'licensed_email' => Arr::get($payload, 'licensed_email'),
                'machine_fingerprint' => Arr::get($payload, 'machine_fingerprint'),
                'country' => config('license.default_country', 'BD'),
                'currency' => config('license.default_currency', 'BDT'),
                'payment_method' => 'bKash',
                'features' => [],
            ];
        }

        $plan = (string) $dummyLicense['plan'];

        return [
            'status' => License::STATUS_ACTIVE,
            'plan' => $plan,
            'licensed_email' => Arr::get($payload, 'licensed_email') ?: $dummyLicense['licensed_email'],
            'machine_fingerprint' => Arr::get($payload, 'machine_fingerprint'),
            'country' => config('license.default_country', 'BD'),
            'currency' => config('license.default_currency', 'BDT'),
            'payment_method' => 'bKash',
            'expires_at' => null,
            'features' => collect(config('license.features', []))
                ->filter(fn (string $minimumPlan) => $this->planRank($plan) >= $this->planRank($minimumPlan))
                ->keys()
                ->values()
                ->all(),
        ];
    }

    protected function dummyLicenses(): Collection
    {
        return collect(config('license.dummy_keys', []));
    }

    protected function planRank(?string $plan): int
    {
        if (! $plan) {
            return 0;
        }

        return (int) config("license.plans.{$plan}.rank", 0);
    }
}
