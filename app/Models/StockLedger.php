<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLedger extends Model
{
    protected $fillable = [
        'product_id',
        'branch_id',
        'movement_type',
        'quantity_change',
        'balance_after',
        'source_type',
        'source_id',
        'notes',
        'causer_id',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function causer()
    {
        return $this->belongsTo(User::class, 'causer_id');
    }
}
