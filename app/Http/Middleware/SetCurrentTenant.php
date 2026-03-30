<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Support\CurrentTenant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SetCurrentTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $tenant = $user?->tenant;
        $tenantContext = app(CurrentTenant::class);

        $tenantContext->setHomeTenant($tenant);

        if ($tenant && $tenant->status !== 'active') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'permission' => 'Your workspace is currently suspended. Please contact support.',
            ]);
        }

        $switchedTenantId = $request->session()->get('tenant_switch.tenant_id');
        $switchedTenant = null;

        if ($user?->isSuperAdmin() && $switchedTenantId) {
            $switchedTenant = Tenant::query()->find($switchedTenantId);

            if (!$switchedTenant) {
                $request->session()->forget('tenant_switch');
            }
        } else {
            $request->session()->forget('tenant_switch');
        }

        $tenantContext->set($switchedTenant ?? $tenant);
        $tenantContext->markAsSwitched((bool) $switchedTenant);

        return $next($request);
    }
}
