<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class SuperAdminDashboardController extends Controller
{
    public function index()
    {
        if (request()->user()?->isOperatingInTenantContext()) {
            return redirect()->route('dashboard');
        }

        $today = now()->startOfDay();
        $attentionWindowEnd = $today->copy()->addDays(7)->endOfDay();
        $monthStart = $today->copy()->startOfMonth();

        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('status', 'active')->count();
        $suspendedTenants = Tenant::where('status', 'suspended')->count();
        $newTenantsThisMonth = Tenant::where('created_at', '>=', $monthStart)->count();

        $activeSubscriptions = Subscription::where('status', 'active')->count();
        $trialSubscriptions = Subscription::where('status', 'trial')->count();
        $expiredSubscriptions = Subscription::where('status', 'expired')->count();
        $cancelledSubscriptions = Subscription::where('status', 'cancelled')->count();

        $trialsEndingSoon = Subscription::query()
            ->where('status', 'trial')
            ->whereBetween('current_period_end', [$today, $attentionWindowEnd])
            ->count();

        $renewalsDueSoon = Subscription::query()
            ->whereIn('status', ['trial', 'active'])
            ->whereBetween('current_period_end', [$today, $attentionWindowEnd])
            ->count();

        $attentionCount = Subscription::query()
            ->where(function ($query) use ($today, $attentionWindowEnd) {
                $query->whereIn('status', ['expired', 'cancelled'])
                    ->orWhere('cancel_at_period_end', true)
                    ->orWhere(function ($windowQuery) use ($today, $attentionWindowEnd) {
                        $windowQuery->whereIn('status', ['trial', 'active'])
                            ->whereBetween('current_period_end', [$today, $attentionWindowEnd]);
                    });
            })
            ->count();

        $mrr = (float) Subscription::query()
            ->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
            ->where('subscriptions.status', 'active')
            ->selectRaw("
                COALESCE(SUM(
                    CASE
                        WHEN subscriptions.billing_cycle = 'yearly' THEN plans.yearly_price / 12
                        ELSE plans.monthly_price
                    END
                ), 0) as total
            ")
            ->value('total');

        $arr = $mrr * 12;

        $planDistribution = Plan::query()
            ->where('is_active', true)
            ->withCount([
                'subscriptions as total_subscriptions',
                'subscriptions as active_subscriptions_count' => function ($query) {
                    $query->where('status', 'active');
                },
                'subscriptions as trial_subscriptions_count' => function ($query) {
                    $query->where('status', 'trial');
                },
            ])
            ->orderBy('sort_order')
            ->get()
            ->map(function (Plan $plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'monthly_price' => (float) $plan->monthly_price,
                    'yearly_price' => (float) $plan->yearly_price,
                    'total_subscriptions' => $plan->total_subscriptions,
                    'active_subscriptions_count' => $plan->active_subscriptions_count,
                    'trial_subscriptions_count' => $plan->trial_subscriptions_count,
                ];
            })
            ->values();

        $recentTenants = Tenant::query()
            ->with(['currentSubscription.plan'])
            ->withCount('users')
            ->latest()
            ->take(6)
            ->get()
            ->map(function (Tenant $tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'status' => $tenant->status,
                    'created_at' => optional($tenant->created_at)->toDateString(),
                    'users_count' => $tenant->users_count,
                    'subscription' => $tenant->currentSubscription ? [
                        'status' => $tenant->currentSubscription->status,
                        'billing_cycle' => $tenant->currentSubscription->billing_cycle,
                        'current_period_end' => optional($tenant->currentSubscription->current_period_end)->toDateString(),
                        'plan_name' => $tenant->currentSubscription->plan?->name,
                    ] : null,
                ];
            })
            ->values();

        $attentionItems = Subscription::query()
            ->with(['tenant:id,name,slug,status', 'plan:id,name'])
            ->where(function ($query) use ($today, $attentionWindowEnd) {
                $query->whereIn('status', ['expired', 'cancelled'])
                    ->orWhere('cancel_at_period_end', true)
                    ->orWhere(function ($windowQuery) use ($today, $attentionWindowEnd) {
                        $windowQuery->whereIn('status', ['trial', 'active'])
                            ->whereBetween('current_period_end', [$today, $attentionWindowEnd]);
                    });
            })
            ->orderByRaw("
                CASE
                    WHEN status IN ('expired', 'cancelled') THEN 0
                    WHEN cancel_at_period_end = 1 THEN 1
                    ELSE 2
                END
            ")
            ->orderBy('current_period_end')
            ->take(8)
            ->get()
            ->map(function (Subscription $subscription) use ($today) {
                $daysRemaining = $subscription->current_period_end
                    ? $today->diffInDays($subscription->current_period_end->copy()->startOfDay(), false)
                    : null;

                return [
                    'id' => $subscription->id,
                    'tenant_id' => $subscription->tenant_id,
                    'tenant_name' => $subscription->tenant?->name,
                    'tenant_slug' => $subscription->tenant?->slug,
                    'tenant_status' => $subscription->tenant?->status,
                    'plan_name' => $subscription->plan?->name,
                    'status' => $subscription->status,
                    'billing_cycle' => $subscription->billing_cycle,
                    'current_period_end' => optional($subscription->current_period_end)->toDateString(),
                    'cancel_at_period_end' => $subscription->cancel_at_period_end,
                    'days_remaining' => $daysRemaining,
                    'attention_label' => $this->attentionLabel($subscription, $daysRemaining),
                ];
            })
            ->values();

        return Inertia::render('SuperAdmin/Dashboard', [
            'summary' => [
                'total_tenants' => $totalTenants,
                'active_tenants' => $activeTenants,
                'suspended_tenants' => $suspendedTenants,
                'new_tenants_this_month' => $newTenantsThisMonth,
                'active_subscriptions' => $activeSubscriptions,
                'trial_subscriptions' => $trialSubscriptions,
                'expired_subscriptions' => $expiredSubscriptions,
                'cancelled_subscriptions' => $cancelledSubscriptions,
                'trials_ending_soon' => $trialsEndingSoon,
                'renewals_due_soon' => $renewalsDueSoon,
                'attention_count' => $attentionCount,
                'platform_users' => User::count(),
                'mrr' => round($mrr, 2),
                'arr' => round($arr, 2),
            ],
            'plan_distribution' => $planDistribution,
            'recent_tenants' => $recentTenants,
            'attention_items' => $attentionItems,
            'generated_at' => Carbon::now()->toIso8601String(),
        ]);
    }

    protected function attentionLabel(Subscription $subscription, ?int $daysRemaining): string
    {
        if (in_array($subscription->status, ['expired', 'cancelled'], true)) {
            return ucfirst($subscription->status);
        }

        if ($subscription->cancel_at_period_end) {
            return 'Cancellation scheduled';
        }

        if ($daysRemaining === null) {
            return 'Needs review';
        }

        if ($daysRemaining < 0) {
            return 'Past due';
        }

        if ($subscription->status === 'trial') {
            return $daysRemaining === 0
                ? 'Trial ends today'
                : "Trial ends in {$daysRemaining} day" . ($daysRemaining === 1 ? '' : 's');
        }

        return $daysRemaining === 0
            ? 'Renews today'
            : "Renews in {$daysRemaining} day" . ($daysRemaining === 1 ? '' : 's');
    }
}
