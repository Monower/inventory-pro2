<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

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
            'view customer',
            'create customer',
            'edit customer',
            'delete customer',
            'view staff',
            'create staff',
            'edit staff',
            'delete staff',
            'view category',
            'create category',
            'edit category',
            'delete category',
            'view subcategory',
            'create subcategory',
            'edit subcategory',
            'delete subcategory',
            'view attribute',
            'create attribute',
            'edit attribute',
            'delete attribute',
            'view attribute value',
            'create attribute value',
            'edit attribute value',
            'delete attribute value',
            'view product',
            'create product',
            'edit product',
            'delete product',
            'view role',
            'create role',
            'edit role',
            'delete role',
            'view user',
            'create user',
            'edit user',
            'delete user',
            'view bank',
            'create bank',
            'edit bank',
            'delete bank',
            'view order',
            'create order',
            'edit order',
            'delete order',
            'view transaction',
            'create transaction',
            'edit transaction',
            'delete transaction',
            'view settings',
            'create settings',
            'edit settings',
            'delete settings',
            'can login',
            'can register',
            'view profile',
            'edit profile',
        ];

        // Create permissions if they don't exist
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Give all permissions to admin
        $adminRole->syncPermissions(Permission::all());

        // Check if there is at least one user
        $user = User::first();

        if (!$user) {
            // Create default admin user
            $user = User::create([
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'password' => '12345678', // hash the password
            ]);
        }

        // Assign admin role if not already assigned
        if (!$user->hasRole('admin')) {
            $user->assignRole($adminRole);
        }
    }
}
