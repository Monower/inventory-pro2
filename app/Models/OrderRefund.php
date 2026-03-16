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
        'resolution_type',
        'bank_id',
        'mfs',
        'total_amount',
        'replacement_total',
        'workflow_status',
        'reviewed_at',
        'reviewed_by',
        'workflow_notes',
        'reason',
        'notes',
        'processed_by',
    ];

    protected $casts = [
        'refunded_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'replacement_total' => 'decimal:2',
        'reviewed_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function items()
    {
        return $this->hasMany(OrderRefundItem::class);
    }

    public function exchangeItems()
    {
        return $this->hasMany(OrderRefundExchangeItem::class);
    }

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
