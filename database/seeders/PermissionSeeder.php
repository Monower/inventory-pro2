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
            'view product',
            'create product',
            'edit product',
            'delete product',
            'view category',
            'create category',
            'edit category',
            'delete category',
            'view attribute',
            'create attribute',
            'edit attribute',
            'delete attribute',
            'view unit',
            'create unit',
            'edit unit',
            'delete unit',
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
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        $allPermissions = Permission::query()->get();
        $tenantAdminPermissions = $allPermissions
            ->whereNotIn('name', $this->platformOnlyPermissions)
            ->values();
        $userPermissions = $allPermissions
            ->whereIn('name', ['view dashboard', 'can login'])
            ->values();

        // Super admin stays in platform scope; tenant admin keeps app modules.
        $superAdminRole->syncPermissions(
            $allPermissions->whereIn('name', $this->superAdminPermissions)->values()
        );
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

        $createdDefaultUser = false;

        if (!$user) {
            // Create default admin user
            $user = User::create([
                'name' => 'Admin',
                'phone' => '01111111111',
                'password' => '12345678', // hash the password
                'tenant_id' => $tenant->id,
            ]);
            $createdDefaultUser = true;
        }

        if (!$user->tenant_id) {
            $user->update(['tenant_id' => $tenant->id]);
        }

        if ($createdDefaultUser && !$user->hasRole('super-admin')) {
            $user->syncRoles([$superAdminRole]);
        }

        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => Config::get('plan_features.starter.description', 'For small businesses that need workspace management.'),
                'monthly_price' => 990,
                'yearly_price' => 9900,
                'trial_days' => 3,
                'sort_order' => 1,
            ],
            [
                'name' => 'Growth',
                'slug' => 'growth',
                'description' => Config::get('plan_features.growth.description', 'For growing teams that need finance controls and broader workspace operations.'),
                'monthly_price' => 1990,
                'yearly_price' => 19900,
                'trial_days' => 3,
                'sort_order' => 2,
            ],
            [
                'name' => 'Scale',
                'slug' => 'scale',
                'description' => Config::get('plan_features.scale.description', 'For mature operations that need governance and broader operational control.'),
                'monthly_price' => 3490,
                'yearly_price' => 34900,
                'trial_days' => 3,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $planData) {
            Plan::updateOrCreate(['slug' => $planData['slug']], $planData + ['is_active' => true]);
        }

    }
}
