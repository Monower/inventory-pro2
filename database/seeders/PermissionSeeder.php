<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define your permissions here
        $permissions = [
            'view dashboard',
            'create customer',
            'edit customer',
            'delete customer',
            'create staff',
            'edit staff',
            'delete staff',
            'delete staff',
            'create category',
            'edit category',
            'delete category',
            'create subcategory',
            'edit subcategory',
            'delete subcategory',
            'create attribute',
            'edit attribute',
            'delete attribute',
            'create product',
            'edit product',
            'delete product',
            'create role',
            'edit role',
            'delete role',
            'create user',
            'edit user',
            'delete user',
            'create bank',
            'edit bank',
            'delete bank',
            'create order',
            'edit order',
            'delete order',
            'create transaction',
            'edit transaction',
            'delete transaction',
            'create settings',
            'edit settings',
            'delete settings',
            'can login',
            'can register'
        ];

        // Create permissions if they don't exist
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Give all permissions to admin
        $adminRole->syncPermissions(Permission::all());

        // Assign admin role to first user (optional)
        $user = User::first();
        if ($user && !$user->hasRole('admin')) {
            $user->assignRole($adminRole);
        }
    }
}
