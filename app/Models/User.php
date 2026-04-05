<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use App\Support\CurrentTenant;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use BelongsToTenant, HasFactory, Notifiable, HasRoles {
        getAllPermissions as protected baseGetAllPermissions;
        hasPermissionTo as protected baseHasPermissionTo;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'tenant_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super-admin');
    }

    public function isOperatingInTenantContext(): bool
    {
        return $this->isSuperAdmin() && app(CurrentTenant::class)->switched();
    }

    public function dashboardRouteName(): string
    {
        return $this->isOperatingInTenantContext() || !$this->isSuperAdmin()
            ? 'dashboard'
            : 'super-admin.dashboard';
    }

    public function getAllPermissions(): Collection
    {
        $permissions = $this->baseGetAllPermissions();

        if (!$this->isOperatingInTenantContext()) {
            return $permissions;
        }

        $tenantAdminRole = Role::query()
            ->with('permissions')
            ->where('name', 'admin')
            ->first();

        return $permissions
            ->merge($tenantAdminRole?->permissions ?? collect())
            ->unique('id')
            ->values();
    }

    public function hasPermissionTo($permission, $guardName = null): bool
    {
        if ($this->baseHasPermissionTo($permission, $guardName)) {
            return true;
        }

        if (!$this->isOperatingInTenantContext()) {
            return false;
        }

        $tenantAdminRole = Role::query()
            ->where('name', 'admin')
            ->first();

        return $tenantAdminRole?->hasPermissionTo($permission, $guardName) ?? false;
    }

    public function visibleRoleNames(): Collection
    {
        return ($this->isSuperAdmin() && !$this->isOperatingInTenantContext())
            ? collect()
            : collect(['super-admin']);
    }
}
