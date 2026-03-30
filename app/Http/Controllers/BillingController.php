<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Services\BillingService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function index()
    {
        $tenant = request()->user()?->tenant;
        $subscription = $tenant?->currentSubscription?->load(['plan', 'nextPlan', 'changes.newPlan', 'changes.oldPlan']);

        return Inertia::render('Billing/Index', [
            'subscription' => $subscription,
            'changes' => $subscription?->changes?->sortByDesc('created_at')->values() ?? [],
        ]);
    }

    public function update(Request $request, BillingService $billingService)
    {
        $tenant = $request->user()?->tenant;
        $subscription = $tenant?->currentSubscription;

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);

        if (!$subscription) {
            $billingService->startSubscription($tenant, $plan, $validated['billing_cycle'], 'Tenant self-service initial subscription.');

            return back()->with('success', 'Subscription started successfully.');
        }

        $result = $billingService->changePlan($subscription, $plan, $validated['billing_cycle'], 'Tenant self-service plan change.');

        $message = match ($result['mode']) {
            'upgraded' => 'Plan upgraded immediately with prorated credit applied.',
            'downgrade_scheduled' => 'Downgrade scheduled for the next renewal date.',
            'reactivated' => 'Subscription renewed and workspace access restored.',
            default => 'Billing updated successfully.',
        };

        return back()->with('success', $message);
    }

    public function renew(BillingService $billingService)
    {
        $tenant = request()->user()?->tenant;
        $subscription = $tenant?->currentSubscription;

        if (!$subscription) {
            return back()->with('error', 'Choose a plan first to start your subscription.');
        }

        $billingService->renew($subscription, 'Tenant self-service renewal.');

        return back()->with('success', 'Subscription renewed successfully.');
    }

    public function cancel(BillingService $billingService)
    {
        $tenant = request()->user()?->tenant;
        $subscription = $tenant?->currentSubscription;

        if (!$subscription) {
            return back()->with('error', 'No active subscription exists for this workspace.');
        }

        $billingService->scheduleCancellation($subscription, 'Tenant self-service cancellation scheduled.');

        return back()->with('success', 'Cancellation scheduled for the end of the current billing period.');
    }

    public function resume(BillingService $billingService)
    {
        $tenant = request()->user()?->tenant;
        $subscription = $tenant?->currentSubscription;

        if (!$subscription) {
            return back()->with('error', 'No active subscription exists for this workspace.');
        }

        $billingService->resume($subscription, 'Tenant self-service cancellation reversed.');

        return back()->with('success', 'Scheduled cancellation removed. Your subscription will continue normally.');
    }
}
