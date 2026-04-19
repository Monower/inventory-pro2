<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    public const WALK_IN_PHONE = '01000000000';
    public const WALK_IN_EMAIL = 'walk-in@example.invalid';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
    ];

    protected $appends = [
        'display_email',
    ];

    public function getDisplayEmailAttribute(): string
    {
        if (blank($this->email) || $this->email === self::WALK_IN_EMAIL) {
            return 'N/A';
        }

        return $this->email;
    }
}
