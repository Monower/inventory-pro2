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

    protected array $superAdminPermissions = [
        'can login',
        'view dashboard',
        'view tenant',
        'edit tenant',
        'view plan',
        'create plan',
        'edit plan',
        'delete plan',
        'view settings',
        'edit settings',
        'view profile',
        'edit profile',
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
        $viewProduct = Permission::firstOrCreate(['name' => 'view product']);
        $createProduct = Permission::firstOrCreate(['name' => 'create product']);
        $editProduct = Permission::firstOrCreate(['name' => 'edit product']);
        $deleteProduct = Permission::firstOrCreate(['name' => 'delete product']);
        $viewCategory = Permission::firstOrCreate(['name' => 'view category']);
        $createCategory = Permission::firstOrCreate(['name' => 'create category']);
        $editCategory = Permission::firstOrCreate(['name' => 'edit category']);
        $deleteCategory = Permission::firstOrCreate(['name' => 'delete category']);
        $viewAttribute = Permission::firstOrCreate(['name' => 'view attribute']);
        $createAttribute = Permission::firstOrCreate(['name' => 'create attribute']);
        $editAttribute = Permission::firstOrCreate(['name' => 'edit attribute']);
        $deleteAttribute = Permission::firstOrCreate(['name' => 'delete attribute']);
        $viewUnit = Permission::firstOrCreate(['name' => 'view unit']);
        $createUnit = Permission::firstOrCreate(['name' => 'create unit']);
        $editUnit = Permission::firstOrCreate(['name' => 'edit unit']);
        $deleteUnit = Permission::firstOrCreate(['name' => 'delete unit']);
        $canLogin = Permission::firstOrCreate(['name' => 'can login']);

        $allPermissions = Permission::query()->get();
        $superAdmin->syncPermissions(
            $allPermissions->whereIn('name', $this->superAdminPermissions)->values()
        );
        $admin->syncPermissions(
            $allPermissions->whereNotIn('name', $this->platformOnlyPermissions)->values()
        );
        $user->syncPermissions(
            $allPermissions->whereIn('name', ['view dashboard', 'can login'])->values()
        );
    }
}
