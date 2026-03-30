<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    protected array $platformOnlyPermissions = [
        'view tenant',
        'edit tenant',
        'view plan',
        'create plan',
        'edit plan',
        'delete plan',
    ];

    public function run()
    {
        // Create roles
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $user = Role::firstOrCreate(['name' => 'user']);

        // Create permissions
        $viewDashboard = Permission::firstOrCreate(['name' => 'view dashboard']);
        $viewTenant = Permission::firstOrCreate(['name' => 'view tenant']);
        $editTenant = Permission::firstOrCreate(['name' => 'edit tenant']);
        $viewPlan = Permission::firstOrCreate(['name' => 'view plan']);
        $createPlan = Permission::firstOrCreate(['name' => 'create plan']);
        $editPlan = Permission::firstOrCreate(['name' => 'edit plan']);
        $deletePlan = Permission::firstOrCreate(['name' => 'delete plan']);
        $viewBilling = Permission::firstOrCreate(['name' => 'view billing']);
        $manageBilling = Permission::firstOrCreate(['name' => 'manage billing']);
        $editUser = Permission::firstOrCreate(['name' => 'edit user']);
        $canLogin = Permission::firstOrCreate(['name' => 'can login']); // ✅ new permission

        $allPermissions = Permission::query()->get();
        $superAdmin->syncPermissions($allPermissions);
        $admin->syncPermissions(
            $allPermissions->whereNotIn('name', $this->platformOnlyPermissions)->values()
        );
        $user->syncPermissions(
            $allPermissions->whereIn('name', ['view dashboard', 'can login'])->values()
        );
    }
}
