<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Create roles
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $user = Role::firstOrCreate(['name' => 'user']);

        // Create permissions
        $viewDashboard = Permission::firstOrCreate(['name' => 'view dashboard']);
        $viewReport = Permission::firstOrCreate(['name' => 'view report']);
        $editUsers = Permission::firstOrCreate(['name' => 'edit users']);
        $canLogin = Permission::firstOrCreate(['name' => 'can login']); // ✅ new permission

        // Assign permissions to roles
        $admin->givePermissionTo([$viewDashboard, $viewReport, $editUsers]);
        $user->givePermissionTo([$viewDashboard, $canLogin]); // ✅ user can login
    }
}
