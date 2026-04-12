<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function switch(Tenant $tenant, Request $request)
    {
        if ($tenant->status !== 'active') {
            return back()->with('error', 'Only active workspaces can be entered.');
        }

        $request->session()->put('tenant_switch', [
            'tenant_id' => $tenant->id,
        ]);

        return redirect()
            ->route('dashboard', status: 303)
            ->with('success', "Switched into {$tenant->name}.");
    }

    public function clearSwitch(Request $request)
    {
        $request->session()->forget('tenant_switch');

        return redirect()
            ->route('super-admin.dashboard', status: 303)
            ->with('success', 'Returned to your home workspace context.');
    }

    public function index()
    {
        $q = trim((string) request()->query('q', ''));
        $activeTenantId = app(\App\Support\CurrentTenant::class)->id();

        $tenants = Tenant::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('slug', 'like', "%{$q}%")
                        ->orWhere('domain', 'like', "%{$q}%")
                        ->orWhere('status', 'like', "%{$q}%");
                });
            })
            ->withCount([
                'users as users_count' => fn ($query) => $query->withoutGlobalScopes(),
            ])
            ->withCount([
                'users as tenant_admins_count' => fn ($query) => $query
                    ->withoutGlobalScopes()
                    ->whereHas('roles', fn ($roleQuery) => $roleQuery->where('name', 'admin')),
            ])
            ->with(['currentSubscription.plan'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('SuperAdmin/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => [
                'q' => $q,
            ],
            'context' => [
                'active_tenant_id' => $activeTenantId,
            ],
            'summary' => [
                'total_tenants' => Tenant::count(),
                'active_tenants' => Tenant::where('status', 'active')->count(),
                'suspended_tenants' => Tenant::where('status', 'suspended')->count(),
                'total_users' => User::withoutGlobalScopes()->count(),
            ],
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,suspended',
        ]);

        if ($request->user()?->tenant_id === $tenant->id) {
            return back()->with('error', 'You cannot change the status of your current workspace.');
        }

        $tenant->update([
            'status' => $validated['status'],
        ]);

        return back()->with('success', 'Workspace status updated successfully.');
    }
}
