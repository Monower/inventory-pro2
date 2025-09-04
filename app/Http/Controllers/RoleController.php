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
        $roles = Role::with('permissions')->get();
        $users = User::with('roles')->get()->map(function ($user) {
            $user->all_permissions = $user->getAllPermissions()->pluck('name');
            return $user;
        });

        return Inertia::render('role/index', compact('users', 'roles'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('role/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'permissions' => 'required',
        ]);


        $role = Role::create(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);


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
    public function edit($user_id)
    {
        $user = User::find($user_id)->with('roles')->first();
        $user->all_permissions = $user->getAllPermissions()->pluck('name');
        $permissions = Permission::all();

        return Inertia::render('role/edit', compact('user', 'permissions'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $user_id)
    {
        $user = User::find($user_id);
        $user->syncRoles($request->roles);
        return to_route('roles.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($role_id)
    {
        $role = Role::find($role_id);

        $role->delete();
        return to_route('roles.index');
    }
}
