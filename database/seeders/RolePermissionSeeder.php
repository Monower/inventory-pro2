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
        $admin = Role::firstOrCreate(['name' => 'super admin']);
        $user = Role::firstOrCreate(['name' => 'staff']);

        // Create permissions
        $viewDashboard = Permission::firstOrCreate(['name' => 'view dashboard']);
        $editEmployee = Permission::firstOrCreate(['name' => 'edit staff']);
        $canLogin = Permission::firstOrCreate(['name' => 'can login']); // ✅ new permission

        // Assign permissions to roles
        $admin->givePermissionTo([$viewDashboard, $editEmployee, $canLogin]);
        $user->givePermissionTo([$viewDashboard, $canLogin]); // ✅ user can login
    }
}
