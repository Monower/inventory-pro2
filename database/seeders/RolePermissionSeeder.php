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
        $editUsers = Permission::firstOrCreate(['name' => 'edit users']);

        // Assign permissions to roles
        $admin->givePermissionTo([$viewDashboard, $editUsers]);
        $user->givePermissionTo($viewDashboard);
    }
}
