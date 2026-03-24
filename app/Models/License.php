<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class License extends Model
{
    public const STATUS_NOT_ACTIVATED = 'not_activated';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INVALID = 'invalid';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_SUSPENDED = 'suspended';

    protected $fillable = [
        'license_key',
        'licensed_email',
        'plan',
        'status',
        'machine_fingerprint',
        'activated_at',
        'last_validated_at',
        'expires_at',
        'last_validation_error',
        'features',
        'meta',
        'payload_signature',
        'payload_data',
    ];

    protected function casts(): array
    {
        return [
            'activated_at' => 'datetime',
            'last_validated_at' => 'datetime',
            'expires_at' => 'datetime',
            'features' => 'array',
            'meta' => 'array',
            'payload_data' => 'array',
        ];
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && (! $this->expires_at || $this->expires_at->isFuture());
    }
}
