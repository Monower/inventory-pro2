<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'name',
        'payment_method',
        'transaction_type',
        'source',
        'amount',
        'tenant_id',
    ];
}
