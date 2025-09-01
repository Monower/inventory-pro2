<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'name',
        'payment_method',
        'transaction_type',
        'source',
        'amount'
    ];
}
