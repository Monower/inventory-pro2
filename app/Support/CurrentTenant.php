<?php

namespace App\Support;

use App\Models\Tenant;

class CurrentTenant
{
    protected ?Tenant $tenant = null;
    protected bool $switched = false;
    protected ?Tenant $homeTenant = null;

    public function set(?Tenant $tenant): void
    {
        $this->tenant = $tenant;
    }

    public function markAsSwitched(bool $switched): void
    {
        $this->switched = $switched;
    }

    public function switched(): bool
    {
        return $this->switched;
    }

    public function setHomeTenant(?Tenant $tenant): void
    {
        $this->homeTenant = $tenant;
    }

    public function homeTenant(): ?Tenant
    {
        return $this->homeTenant;
    }

    public function get(): ?Tenant
    {
        return $this->tenant;
    }

    public function id(): ?int
    {
        return $this->tenant?->id;
    }
}
