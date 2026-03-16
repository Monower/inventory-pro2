<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\Staff;

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
            'view supplier',
            'create supplier',
            'edit supplier',
            'delete supplier',
            'pay supplier due',
            'view branch',
            'create branch',
            'edit branch',
            'delete branch',
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
            'view bank',
            'create bank',
            'edit bank',
            'delete bank',
            'view order',
            'create order',
            'edit order',
            'delete order',
            'refund order',
            'collect order payment',
            'change order status',
            'manage order fulfillment',
            'print order invoice',
            'approve refund case',
            'reject refund case',
            'view coupon',
            'create coupon',
            'edit coupon',
            'delete coupon',
            'view stock ledger',
            'view stock transfer',
            'create stock transfer',
            'approve stock transfer',
            'dispatch stock transfer',
            'receive stock transfer',
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
            'view purchase',
            'create purchase',
            'edit purchase',
            'delete purchase',
            'view salary',
            'create salary',
            'edit salary',
            'delete salary',
            'view advance salary',
            'create advance salary',
            'edit advance salary',
            'delete advance salary',
        ];

        // Create permissions if they don't exist
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        Permission::query()->whereIn('name', [
            'view user',
            'create user',
            'edit user',
            'delete user',
        ])->delete();

        // Create admin role
        $adminRole = Role::firstOrCreate(['name' => 'super admin']);
        Role::firstOrCreate(['name' => 'staff']);
        Role::query()->whereIn('name', ['admin', 'user'])->delete();

        // Give all permissions to admin
        $adminRole->syncPermissions(Permission::all());

        // Check if there is at least one user
        $user = Staff::first();

        if (!$user) {
            $user = Staff::create([
                'name' => 'Super Admin',
                'phone' => '01111111111',
                'password' => '12345678',
            ]);
        }

        if (!$user->hasRole('super admin')) {
            $user->assignRole($adminRole);
        }
    }
}
