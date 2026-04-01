<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    protected array $platformOnlyPermissions = [
        'view tenant',
        'edit tenant',
        'view plan',
        'create plan',
        'edit plan',
        'delete plan',
    ];

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
            'view tenant',
            'edit tenant',
            'view plan',
            'create plan',
            'edit plan',
            'delete plan',
            'view billing',
            'manage billing',
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
        ];

        // Create permissions if they don't exist
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        $allPermissions = Permission::query()->get();
        $tenantAdminPermissions = $allPermissions
            ->whereNotIn('name', $this->platformOnlyPermissions)
            ->values();
        $userPermissions = $allPermissions
            ->whereIn('name', ['view dashboard', 'can login'])
            ->values();

        // Platform owner keeps all permissions, tenant admin gets app-only permissions.
        $superAdminRole->syncPermissions($allPermissions);
        $adminRole->syncPermissions($tenantAdminPermissions);
        $userRole->syncPermissions($userPermissions);

        // Check if there is at least one user
        $user = User::first();
        $tenant = Tenant::first();

        if (!$tenant) {
            $tenant = Tenant::create([
                'name' => 'Default Workspace',
                'slug' => Str::slug('Default Workspace'),
                'status' => 'active',
            ]);
        }

        if (!$user) {
            // Create default admin user
            $user = User::create([
                'name' => 'Admin',
                'phone' => '01111111111',
                'password' => '12345678', // hash the password
                'tenant_id' => $tenant->id,
            ]);
        }

        if (!$user->tenant_id) {
            $user->update(['tenant_id' => $tenant->id]);
        }

        // Assign admin role if not already assigned
        if (!$user->hasRole('admin')) {
            $user->assignRole($adminRole);
        }

        if (!$user->hasRole('super-admin')) {
            $user->assignRole($superAdminRole);
        }

        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => Config::get('plan_features.starter.description', 'For small businesses that need core inventory, sales, customer, and workspace management.'),
                'monthly_price' => 990,
                'yearly_price' => 9900,
                'trial_days' => 14,
                'sort_order' => 1,
            ],
            [
                'name' => 'Growth',
                'slug' => 'growth',
                'description' => Config::get('plan_features.growth.description', 'For growing teams that need purchasing, finance controls, and multi-user operations.'),
                'monthly_price' => 1990,
                'yearly_price' => 19900,
                'trial_days' => 14,
                'sort_order' => 2,
            ],
            [
                'name' => 'Scale',
                'slug' => 'scale',
                'description' => Config::get('plan_features.scale.description', 'For mature operations that need governance, payroll workflows, and broader operational control.'),
                'monthly_price' => 3490,
                'yearly_price' => 34900,
                'trial_days' => 14,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $planData) {
            Plan::updateOrCreate(['slug' => $planData['slug']], $planData + ['is_active' => true]);
        }

    }
}
