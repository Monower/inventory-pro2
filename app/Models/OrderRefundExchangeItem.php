<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderRefundExchangeItem extends Model
{
    protected $fillable = [
        'order_refund_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_amount',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function refund()
    {
        return $this->belongsTo(OrderRefund::class, 'order_refund_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
