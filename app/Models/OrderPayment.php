<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderPayment extends Model
{
    protected $fillable = [
        'order_id',
        'payment_number',
        'paid_at',
        'amount',
        'payment_method',
        'bank_id',
        'mfs',
        'notes',
        'received_by',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    public function receivedBy()
    {
        return $this->belongsTo(Staff::class, 'received_by');
    }
}
