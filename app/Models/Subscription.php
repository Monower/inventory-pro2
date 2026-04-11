<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'plan_id',
        'status',
        'billing_cycle',
        'current_period_start',
        'current_period_end',
        'trial_ends_at',
        'expired_at',
        'cancel_at_period_end',
        'cancelled_at',
        'next_plan_id',
        'next_billing_cycle',
        'scheduled_change_type',
        'scale_data_retention_started_at',
        'scale_data_retained_until',
    ];

    protected function casts(): array
    {
        return [
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'trial_ends_at' => 'datetime',
            'expired_at' => 'datetime',
            'cancel_at_period_end' => 'boolean',
            'cancelled_at' => 'datetime',
            'scale_data_retention_started_at' => 'datetime',
            'scale_data_retained_until' => 'datetime',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function nextPlan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'next_plan_id');
    }

    public function changes(): HasMany
    {
        return $this->hasMany(SubscriptionChange::class);
    }
}
