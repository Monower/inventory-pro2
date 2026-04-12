<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'values',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'values' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
