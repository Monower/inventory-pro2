<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $q = trim((string) request()->query('q', ''));
        $authUser = request()->user();
        $isPlatformSuperAdmin = $authUser->isSuperAdmin() && !$authUser->isOperatingInTenantContext();

        $roles = Role::with('permissions')
            ->when(!$isPlatformSuperAdmin, function ($query) {
                $query->where('name', '!=', 'super-admin');
            })
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhereHas('permissions', function ($permissionQuery) use ($q) {
                            $permissionQuery->where('name', 'like', "%{$q}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('role/index', [
            'roles' => $roles,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permissions = $this->availablePermissions(request()->user());
        return Inertia::render('role/create', compact('permissions'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $permissionNames = $this->availablePermissions($request->user())->pluck('name');

        $validated = $request->validate([
            'name' => 'required',
            'permissions' => 'required',
        ]);

        if ((!$request->user()->isSuperAdmin() || $request->user()->isOperatingInTenantContext()) && $validated['name'] === 'super-admin') {
            abort(403);
        }

        $role = Role::create(['name' => $validated['name']]);
        $role->syncPermissions(
            collect($validated['permissions'] ?? [])->intersect($permissionNames)->values()
        );


        return to_route('roles.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($role_id)
    {
        $role = Role::find($role_id)->load('permissions');
        if (!$role || ((!request()->user()->isSuperAdmin() || request()->user()->isOperatingInTenantContext()) && $role->name === 'super-admin')) {
            abort(403);
        }

        $permissions = $this->availablePermissions(request()->user());
        return Inertia::render('role/edit', compact('role', 'permissions'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $role_id)
    {
        $role = Role::find($role_id);
        if (!$role || ((!request()->user()->isSuperAdmin() || request()->user()->isOperatingInTenantContext()) && $role->name === 'super-admin')) {
            abort(403);
        }

        $permissionNames = $this->availablePermissions($request->user())->pluck('name');

        $validated = $request->validate([
            'name' => 'required',
            'permissions' => 'required',
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions(
            collect($validated['permissions'] ?? [])->intersect($permissionNames)->values()
        );

        return to_route('roles.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($role_id)
    {
        $role = Role::find($role_id);
        if (!$role || ((!request()->user()->isSuperAdmin() || request()->user()->isOperatingInTenantContext()) && $role->name === 'super-admin')) {
            abort(403);
        }

        $role->delete();
        return to_route('roles.index');
    }

    protected function availablePermissions(User $user)
    {
        return Permission::query()
            ->when(!$user->isSuperAdmin() || $user->isOperatingInTenantContext(), function ($query) {
                $query->whereNotIn('name', [
                    'view tenant',
                    'edit tenant',
                    'view plan',
                    'create plan',
                    'edit plan',
                    'delete plan',
                    'manage billing',
                ]);
            })
            ->orderBy('name')
            ->get();
    }
}
