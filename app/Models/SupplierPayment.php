<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierPayment extends Model
{
    protected $fillable = [
        'supplier_id',
        'purchase_id',
        'branch_id',
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

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
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
