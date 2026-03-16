<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderRefundItem extends Model
{
    protected $fillable = [
        'order_refund_id',
        'order_item_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_amount',
        'restock_to_inventory',
    ];

    protected $casts = [
        'restock_to_inventory' => 'boolean',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function refund()
    {
        return $this->belongsTo(OrderRefund::class, 'order_refund_id');
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
