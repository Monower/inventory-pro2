<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_users_cannot_assign_the_admin_role(): void
    {
        Permission::findOrCreate('create user');

        $managerRole = Role::create(['name' => 'manager']);
        $adminRole = Role::create(['name' => 'admin']);

        $actor = User::factory()->create();
        $actor->assignRole($managerRole);
        $actor->givePermissionTo('create user');

        $response = $this->actingAs($actor)->from('/user/create')->post('/user/create', [
            'name' => 'Escalation Attempt',
            'email' => 'escalation@example.com',
            'phone' => '01712345678',
            'password' => 'password123',
            'role' => $adminRole->name,
        ]);

        $response->assertRedirect('/user/create');
        $response->assertSessionHasErrors('role');
        $this->assertDatabaseMissing('users', ['email' => 'escalation@example.com']);
    }
}
