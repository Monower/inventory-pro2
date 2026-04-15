<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'name',
        'transaction_date',
        'payment_method',
        'transaction_type',
        'source',
        'destination',
        'amount',
        'bank_name',
        'branch_name',
        'transaction_id',
    ];
}
