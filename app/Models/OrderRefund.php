<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderRefund extends Model
{
    protected $fillable = [
        'order_id',
        'refund_number',
        'refunded_at',
        'refund_method',
        'bank_id',
        'mfs',
        'total_amount',
        'reason',
        'notes',
        'processed_by',
    ];

    protected $casts = [
        'refunded_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function items()
    {
        return $this->hasMany(OrderRefundItem::class);
    }

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }
}
