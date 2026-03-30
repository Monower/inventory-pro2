<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Tenant;
use App\Services\BillingService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TenantBillingController extends Controller
{
    public function edit(Tenant $tenant)
    {
        $tenant->load(['currentSubscription.plan', 'currentSubscription.nextPlan', 'currentSubscription.changes.newPlan', 'currentSubscription.changes.oldPlan']);

        return Inertia::render('SuperAdmin/TenantBilling/Edit', [
            'workspace' => $tenant,
            'plans' => Plan::query()->where('is_active', true)->orderBy('sort_order')->get(),
            'subscription' => $tenant->currentSubscription,
            'changes' => $tenant->currentSubscription?->changes?->sortByDesc('created_at')->values() ?? [],
        ]);
    }

    public function update(Request $request, Tenant $tenant, BillingService $billingService)
    {
        $subscription = $tenant->currentSubscription;

        if (!$subscription) {
            return back()->with('error', 'No billing record exists for this workspace.');
        }

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'notes' => 'nullable|string|max:1000',
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);
        $result = $billingService->changePlan($subscription, $plan, $validated['billing_cycle'], $validated['notes'] ?? null);

        $message = match ($result['mode']) {
            'upgraded' => 'Plan upgraded immediately with prorated billing applied.',
            'downgrade_scheduled' => 'Downgrade scheduled for the next billing renewal.',
            'reactivated' => 'Expired workspace reactivated on the selected plan.',
            default => 'Subscription updated successfully.',
        };

        return back()->with('success', $message);
    }

    public function renew(Request $request, Tenant $tenant, BillingService $billingService)
    {
        $subscription = $tenant->currentSubscription;

        if (!$subscription) {
            return back()->with('error', 'No billing record exists for this workspace.');
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $billingService->renew($subscription, $validated['notes'] ?? null);

        return back()->with('success', 'Renewal recorded successfully.');
    }
}
