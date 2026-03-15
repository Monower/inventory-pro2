<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class VerifiedMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_users_are_redirected_away_from_salary_routes(): void
    {
        Permission::findOrCreate('view salary');

        $user = User::factory()->unverified()->create();
        $user->givePermissionTo('view salary');

        $response = $this->actingAs($user)->get('/salaries');

        $response->assertRedirect(route('verification.notice'));
    }

    public function test_verified_users_can_access_salary_routes_with_permission(): void
    {
        Permission::findOrCreate('view salary');

        $user = User::factory()->create();
        $user->givePermissionTo('view salary');

        $response = $this->actingAs($user)->get('/salaries');

        $response->assertOk();
    }
}
