<?php

namespace App\Http\Middleware;

use App\Services\BillingService;
use App\Support\CurrentTenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantSubscriptionAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->isSuperAdmin()) {
            return $next($request);
        }

        $tenant = app(CurrentTenant::class)->get();

        if (!$tenant) {
            return $next($request);
        }

        $subscription = $tenant->currentSubscription;

        if (!$subscription) {
            return $this->redirectToBilling($request, 'No active billing record was found for your workspace.');
        }

        $subscription = app(BillingService::class)->sync($subscription);

        if (!in_array($subscription->status, ['expired', 'cancelled'], true)) {
            return $next($request);
        }

        $routeName = $request->route()?->getName();

        if ($routeName && (
            str_starts_with($routeName, 'billing.') ||
            str_starts_with($routeName, 'settings.') ||
            str_starts_with($routeName, 'profile.') ||
            in_array($routeName, ['logout', 'password.update'], true)
        )) {
            return $next($request);
        }

        return $this->redirectToBilling(
            $request,
            'Your subscription has expired. Renew or change plan to restore workspace access.'
        );
    }

    protected function redirectToBilling(Request $request, string $message): Response
    {
        return redirect()->route('billing.index')->with('error', $message);
    }
}
