<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionChange;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BillingService
{
    public function startSubscription(Tenant $tenant, Plan $plan, string $cycle = 'monthly', ?string $notes = null): Subscription
    {
        return DB::transaction(function () use ($tenant, $plan, $cycle, $notes) {
            $now = now();
            $subscription = Subscription::updateOrCreate(
                ['tenant_id' => $tenant->id],
                [
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'billing_cycle' => $cycle,
                    'current_period_start' => $now,
                    'current_period_end' => $this->periodEnd($now, $cycle),
                    'trial_ends_at' => null,
                    'expired_at' => null,
                    'cancel_at_period_end' => false,
                    'cancelled_at' => null,
                    'next_plan_id' => null,
                    'next_billing_cycle' => null,
                    'scheduled_change_type' => null,
                ]
            );

            $this->recordChange($subscription, [
                'event_type' => 'subscription_started',
                'old_plan_id' => null,
                'new_plan_id' => $plan->id,
                'old_billing_cycle' => null,
                'new_billing_cycle' => $cycle,
                'amount' => $plan->priceForCycle($cycle),
                'credit_amount' => 0,
                'notes' => $notes ?: 'Initial subscription started.',
                'effective_at' => $now,
            ]);

            return $subscription->fresh(['plan', 'nextPlan']);
        });
    }

    public function provisionTrial(Tenant $tenant, Plan $plan, string $cycle = 'monthly'): Subscription
    {
        $now = now();
        $trialEndsAt = $now->copy()->addDays(max(1, $plan->trial_days));

        return Subscription::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'plan_id' => $plan->id,
                'status' => 'trial',
                'billing_cycle' => $cycle,
                'current_period_start' => $now,
                'current_period_end' => $trialEndsAt,
                'trial_ends_at' => $trialEndsAt,
                'expired_at' => null,
                'cancel_at_period_end' => false,
                'cancelled_at' => null,
                'next_plan_id' => null,
                'next_billing_cycle' => null,
                'scheduled_change_type' => null,
            ]
        );
    }

    public function sync(Subscription $subscription): Subscription
    {
        if (in_array($subscription->status, ['trial', 'active'], true) &&
            $subscription->current_period_end &&
            now()->greaterThan($subscription->current_period_end)) {
            if ($subscription->cancel_at_period_end) {
                $subscription->update([
                    'status' => 'cancelled',
                    'expired_at' => now(),
                    'cancelled_at' => now(),
                ]);
            } else {
                $subscription->update([
                    'status' => 'expired',
                    'expired_at' => now(),
                ]);
            }
        }

        return $subscription->fresh(['plan', 'nextPlan']);
    }

    public function renew(Subscription $subscription, ?string $notes = null): Subscription
    {
        return DB::transaction(function () use ($subscription, $notes) {
            $subscription = $subscription->fresh(['plan', 'nextPlan']);
            $now = now();

            if ($subscription->nextPlan && $subscription->scheduled_change_type === 'downgrade') {
                $subscription->plan_id = $subscription->nextPlan->id;
                $subscription->billing_cycle = $subscription->next_billing_cycle ?? $subscription->billing_cycle;
            }

            $plan = $subscription->plan()->firstOrFail();
            $cycle = $subscription->billing_cycle;
            $base = $subscription->current_period_end && $subscription->current_period_end->isFuture()
                ? $subscription->current_period_end->copy()
                : $now->copy();

            $nextEnd = $this->periodEnd($base, $cycle);

            $subscription->update([
                'status' => 'active',
                'current_period_start' => $base,
                'current_period_end' => $nextEnd,
                'trial_ends_at' => null,
                'expired_at' => null,
                'cancel_at_period_end' => false,
                'cancelled_at' => null,
                'next_plan_id' => null,
                'next_billing_cycle' => null,
                'scheduled_change_type' => null,
            ]);

            $this->recordChange($subscription, [
                'event_type' => 'renewal',
                'old_plan_id' => $plan->id,
                'new_plan_id' => $plan->id,
                'old_billing_cycle' => $cycle,
                'new_billing_cycle' => $cycle,
                'amount' => $plan->priceForCycle($cycle),
                'credit_amount' => 0,
                'notes' => $notes ?: ucfirst($cycle) . ' renewal applied.',
                'effective_at' => $base,
            ]);

            return $subscription->fresh(['plan', 'nextPlan']);
        });
    }

    public function changePlan(Subscription $subscription, Plan $targetPlan, string $targetCycle, ?string $notes = null): array
    {
        return DB::transaction(function () use ($subscription, $targetPlan, $targetCycle, $notes) {
            $subscription = $subscription->fresh(['plan', 'nextPlan']);
            $subscription = $this->sync($subscription);

            $currentPlan = $subscription->plan()->firstOrFail();
            $currentCycle = $subscription->billing_cycle;
            $currentPrice = $currentPlan->priceForCycle($currentCycle);
            $targetPrice = $targetPlan->priceForCycle($targetCycle);

            if (in_array($subscription->status, ['expired', 'cancelled'], true)) {
                $subscription->update([
                    'plan_id' => $targetPlan->id,
                    'billing_cycle' => $targetCycle,
                    'status' => 'active',
                    'current_period_start' => now(),
                    'current_period_end' => $this->periodEnd(now(), $targetCycle),
                    'trial_ends_at' => null,
                    'expired_at' => null,
                    'cancel_at_period_end' => false,
                    'cancelled_at' => null,
                    'next_plan_id' => null,
                    'next_billing_cycle' => null,
                    'scheduled_change_type' => null,
                ]);

                $this->recordChange($subscription, [
                    'event_type' => 'reactivation',
                    'old_plan_id' => $currentPlan->id,
                    'new_plan_id' => $targetPlan->id,
                    'old_billing_cycle' => $currentCycle,
                    'new_billing_cycle' => $targetCycle,
                    'amount' => $targetPrice,
                    'credit_amount' => 0,
                    'notes' => $notes ?: 'Subscription reactivated.',
                    'effective_at' => now(),
                ]);

                return ['mode' => 'reactivated', 'subscription' => $subscription->fresh(['plan', 'nextPlan'])];
            }

            if ($targetPrice > $currentPrice || $subscription->status === 'trial') {
                $periodStart = $subscription->current_period_start ?? now();
                $periodEnd = $subscription->current_period_end ?? now();
                $now = now();
                $periodSeconds = max(1, $periodEnd->getTimestamp() - $periodStart->getTimestamp());
                $remainingSeconds = $periodEnd->isFuture()
                    ? max(0, $periodEnd->getTimestamp() - $now->getTimestamp())
                    : 0;
                $remainingRatio = min(1, max(0, $remainingSeconds / $periodSeconds));
                $credit = $subscription->status === 'trial'
                    ? 0
                    : round(min($currentPrice, $currentPrice * $remainingRatio), 2);
                $amount = round(max($targetPrice - $credit, 0), 2);

                $subscription->update([
                    'plan_id' => $targetPlan->id,
                    'billing_cycle' => $targetCycle,
                    'status' => 'active',
                    'current_period_start' => $now,
                    'current_period_end' => $this->periodEnd($now, $targetCycle),
                    'trial_ends_at' => null,
                    'expired_at' => null,
                    'cancel_at_period_end' => false,
                    'cancelled_at' => null,
                    'next_plan_id' => null,
                    'next_billing_cycle' => null,
                    'scheduled_change_type' => null,
                ]);

                $this->recordChange($subscription, [
                    'event_type' => 'upgrade',
                    'old_plan_id' => $currentPlan->id,
                    'new_plan_id' => $targetPlan->id,
                    'old_billing_cycle' => $currentCycle,
                    'new_billing_cycle' => $targetCycle,
                    'amount' => $amount,
                    'credit_amount' => $credit,
                    'notes' => $notes ?: 'Upgrade applied immediately with prorated credit.',
                    'effective_at' => $now,
                ]);

                return [
                    'mode' => 'upgraded',
                    'amount' => $amount,
                    'credit' => $credit,
                    'subscription' => $subscription->fresh(['plan', 'nextPlan']),
                ];
            }

            $subscription->update([
                'next_plan_id' => $targetPlan->id,
                'next_billing_cycle' => $targetCycle,
                'scheduled_change_type' => 'downgrade',
            ]);

            $this->recordChange($subscription, [
                'event_type' => 'downgrade_scheduled',
                'old_plan_id' => $currentPlan->id,
                'new_plan_id' => $targetPlan->id,
                'old_billing_cycle' => $currentCycle,
                'new_billing_cycle' => $targetCycle,
                'amount' => 0,
                'credit_amount' => 0,
                'notes' => $notes ?: 'Downgrade scheduled for the next billing renewal.',
                'effective_at' => $subscription->current_period_end,
            ]);

            return ['mode' => 'downgrade_scheduled', 'subscription' => $subscription->fresh(['plan', 'nextPlan'])];
        });
    }

    public function scheduleCancellation(Subscription $subscription, ?string $notes = null): Subscription
    {
        return DB::transaction(function () use ($subscription, $notes) {
            $subscription = $subscription->fresh(['plan']);

            $subscription->update([
                'cancel_at_period_end' => true,
                'scheduled_change_type' => 'cancel',
                'next_plan_id' => null,
                'next_billing_cycle' => null,
            ]);

            $this->recordChange($subscription, [
                'event_type' => 'cancellation_scheduled',
                'old_plan_id' => $subscription->plan_id,
                'new_plan_id' => null,
                'old_billing_cycle' => $subscription->billing_cycle,
                'new_billing_cycle' => null,
                'amount' => 0,
                'credit_amount' => 0,
                'notes' => $notes ?: 'Cancellation scheduled for the end of the current billing period.',
                'effective_at' => $subscription->current_period_end,
            ]);

            return $subscription->fresh(['plan', 'nextPlan']);
        });
    }

    public function resume(Subscription $subscription, ?string $notes = null): Subscription
    {
        return DB::transaction(function () use ($subscription, $notes) {
            $subscription = $subscription->fresh(['plan']);

            $subscription->update([
                'cancel_at_period_end' => false,
                'scheduled_change_type' => null,
                'next_plan_id' => null,
                'next_billing_cycle' => null,
            ]);

            $this->recordChange($subscription, [
                'event_type' => 'cancellation_reversed',
                'old_plan_id' => $subscription->plan_id,
                'new_plan_id' => $subscription->plan_id,
                'old_billing_cycle' => $subscription->billing_cycle,
                'new_billing_cycle' => $subscription->billing_cycle,
                'amount' => 0,
                'credit_amount' => 0,
                'notes' => $notes ?: 'Scheduled cancellation removed.',
                'effective_at' => now(),
            ]);

            return $subscription->fresh(['plan', 'nextPlan']);
        });
    }

    public function summary(?Subscription $subscription): ?array
    {
        if (!$subscription) {
            return null;
        }

        $subscription = $this->sync($subscription);
        $daysRemaining = $subscription->current_period_end
            ? now()->startOfDay()->diffInDays($subscription->current_period_end->copy()->startOfDay(), false)
            : null;

        $alert = null;

        if (in_array($subscription->status, ['expired', 'cancelled'], true)) {
            $alert = [
                'type' => 'error',
                'title' => $subscription->status === 'cancelled' ? 'Subscription cancelled' : 'Subscription expired',
                'message' => 'Renew your subscription to restore full workspace access.',
            ];
        } elseif ($daysRemaining !== null && in_array($daysRemaining, [14, 7, 3, 1, 0], true)) {
            $alert = [
                'type' => $subscription->status === 'trial' ? 'warning' : 'info',
                'title' => $subscription->status === 'trial' ? 'Trial ending soon' : 'Subscription renewal coming up',
                'message' => $daysRemaining === 0
                    ? 'Your billing period ends today.'
                    : "Your {$subscription->billing_cycle} plan ends in {$daysRemaining} day" . ($daysRemaining === 1 ? '' : 's') . '.',
            ];
        }

        if ($subscription->cancel_at_period_end) {
            $alert = [
                'type' => 'warning',
                'title' => 'Cancellation scheduled',
                'message' => 'Your workspace will lose access at the end of the current billing period unless you resume billing.',
            ];
        } elseif ($subscription->nextPlan && $subscription->scheduled_change_type === 'downgrade') {
            $alert = [
                'type' => 'info',
                'title' => 'Downgrade scheduled',
                'message' => "Your workspace will move to {$subscription->nextPlan->name} ({$subscription->next_billing_cycle}) at renewal.",
            ];
        }

        return [
            'subscription_id' => $subscription->id,
            'status' => $subscription->status,
            'billing_cycle' => $subscription->billing_cycle,
            'current_period_start' => $subscription->current_period_start?->toDateString(),
            'current_period_end' => $subscription->current_period_end?->toDateString(),
            'trial_ends_at' => $subscription->trial_ends_at?->toDateString(),
            'expired_at' => $subscription->expired_at?->toDateString(),
            'cancel_at_period_end' => $subscription->cancel_at_period_end,
            'cancelled_at' => $subscription->cancelled_at?->toDateString(),
            'days_remaining' => $daysRemaining,
            'plan' => $subscription->plan ? [
                'id' => $subscription->plan->id,
                'name' => $subscription->plan->name,
                'monthly_price' => (float) $subscription->plan->monthly_price,
                'yearly_price' => (float) $subscription->plan->yearly_price,
            ] : null,
            'next_plan' => $subscription->nextPlan ? [
                'id' => $subscription->nextPlan->id,
                'name' => $subscription->nextPlan->name,
                'billing_cycle' => $subscription->next_billing_cycle,
            ] : null,
            'alert' => $alert,
        ];
    }

    protected function recordChange(Subscription $subscription, array $attributes): void
    {
        SubscriptionChange::create(array_merge($attributes, [
            'tenant_id' => $subscription->tenant_id,
            'subscription_id' => $subscription->id,
        ]));
    }

    protected function periodEnd(Carbon $start, string $cycle): Carbon
    {
        return $cycle === 'yearly'
            ? $start->copy()->addYear()
            : $start->copy()->addMonth();
    }
}
