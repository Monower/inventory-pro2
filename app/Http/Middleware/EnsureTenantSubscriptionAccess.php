<?php

namespace App\Http\Middleware;

use App\Services\BillingService;
use App\Services\PlanFeatureService;
use App\Support\CurrentTenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantSubscriptionAccess
{
    public function __construct(protected PlanFeatureService $planFeatures)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || ($user->isSuperAdmin() && !$user->isOperatingInTenantContext())) {
            return $next($request);
        }

        $tenant = app(CurrentTenant::class)->get();

        if (!$tenant) {
            return $next($request);
        }

        $routeName = $request->route()?->getName();
        $minimumPlan = $this->planFeatures->minimumPlanForRoute($routeName);

        if ($request->isMethodSafe(false) && !$minimumPlan) {
            return $next($request);
        }

        if ($this->routeAllowsWriteWithoutSubscription($request)) {
            return $next($request);
        }

        $subscription = $tenant->currentSubscription;

        if (!$subscription) {
            return $this->denyWriteAccess($request);
        }

        $subscription = app(BillingService::class)->sync($subscription);

        if (in_array($subscription->status, ['expired', 'cancelled'], true)) {
            return $this->denyWriteAccess($request);
        }

        if (!$this->planFeatures->canAccess($subscription, $minimumPlan)) {
            return $this->denyPlanFeatureAccess($request, $this->planFeatures->upgradeMessage($minimumPlan));
        }

        return $next($request);
    }

    protected function routeAllowsWriteWithoutSubscription(Request $request): bool
    {
        $routeName = $request->route()?->getName();

        if (!$routeName) {
            return false;
        }

        return str_starts_with($routeName, 'billing.')
            || str_starts_with($routeName, 'profile.')
            || str_starts_with($routeName, 'verification.')
            || in_array($routeName, ['logout', 'password.update'], true);
    }

    protected function denyWriteAccess(Request $request): Response
    {
        return back()->with(
            'error',
            'Your workspace is in read-only mode. Purchase a plan to create, update, or delete records.'
        );
    }

    protected function denyPlanFeatureAccess(Request $request, string $message): Response
    {
        if ($request->isMethodSafe(false)) {
            return redirect()->route('billing.index')->with('error', $message);
        }

        return back()->with('error', $message);
    }
}
