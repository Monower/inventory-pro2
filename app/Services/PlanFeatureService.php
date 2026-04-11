<?php

namespace App\Services;

use App\Models\Subscription;
use Illuminate\Support\Str;

class PlanFeatureService
{
    public const RETENTION_DAYS = 30;

    protected array $planRanks = [
        'starter' => 1,
        'growth' => 2,
        'scale' => 3,
    ];

    protected array $minimumPlanByRoute = [
        'attributes.*' => 'growth',
        'banks.*' => 'growth',
        'orders.invoice' => 'growth',
        'orders.receipt' => 'growth',
        'purchases.*' => 'growth',
        'staff.*' => 'growth',
        'staffs.*' => 'growth',
        'transactions.*' => 'growth',
        'transaction.*' => 'growth',
        'user.*' => 'growth',
        'users.*' => 'growth',

        'advance-salaries.*' => 'scale',
        'role.*' => 'scale',
        'roles.*' => 'scale',
        'salaries.*' => 'scale',
    ];

    public function minimumPlanForRoute(?string $routeName): ?string
    {
        if (!$routeName) {
            return null;
        }

        foreach ($this->minimumPlanByRoute as $pattern => $minimumPlan) {
            if (Str::is($pattern, $routeName)) {
                return $minimumPlan;
            }
        }

        return null;
    }

    public function accessPlanSlug(?Subscription $subscription): ?string
    {
        if (!$subscription) {
            return null;
        }

        if ($subscription->status === 'trial') {
            return 'scale';
        }

        return Str::lower((string) $subscription->plan?->slug) ?: null;
    }

    public function canAccess(?Subscription $subscription, ?string $minimumPlan): bool
    {
        if (!$minimumPlan) {
            return true;
        }

        $accessPlan = $this->accessPlanSlug($subscription);

        return $this->rank($accessPlan) >= $this->rank($minimumPlan);
    }

    public function isDowngrade(?string $fromPlan, ?string $toPlan): bool
    {
        return $this->rank($toPlan) < $this->rank($fromPlan);
    }

    public function rank(?string $planSlug): int
    {
        return $this->planRanks[Str::lower((string) $planSlug)] ?? 0;
    }

    public function displayName(?string $planSlug): string
    {
        return match (Str::lower((string) $planSlug)) {
            'growth' => 'Growth',
            'scale' => 'Scale',
            'starter' => 'Starter',
            default => 'paid plan',
        };
    }

    public function upgradeMessage(?string $minimumPlan): string
    {
        $planName = $this->displayName($minimumPlan);

        return "This is a {$planName} feature. Upgrade now to use it.";
    }
}
