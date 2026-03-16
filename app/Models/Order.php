<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    public const STATUSES = [
        'draft',
        'confirmed',
        'processing',
        'completed',
        'cancelled',
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'order_number',
        'customer_id',
        'total_amount',
        'paid_amount',
        'due_amount',
        'refunded_amount',
        'payment_status',
        'refund_status',
        'order_status',
        'payment_method',
        'bank_id',
        'mfs',
    ];

    /**
     * Relationship: An order belongs to a customer.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Accessor for checking if the order is fully paid.
     */
    public function getIsPaidAttribute(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Scope: Filter only paid orders.
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Scope: Filter only pending orders.
     */
    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function refunds()
    {
        return $this->hasMany(OrderRefund::class)->latest('refunded_at');
    }

    public function payments()
    {
        return $this->hasMany(OrderPayment::class)->latest('paid_at');
    }

    public function activityLogs()
    {
        return $this->hasMany(OrderActivityLog::class)->latest();
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot('quantity', 'price')
            ->withTimestamps();
    }

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    public function getRefundableAmountAttribute(): float
    {
        return max((float) $this->paid_amount - (float) $this->refunded_amount, 0);
    }

    public function getOutstandingAmountAttribute(): float
    {
        return max((float) $this->total_amount - (float) $this->paid_amount, 0);
    }
}
