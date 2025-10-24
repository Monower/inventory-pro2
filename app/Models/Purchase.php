<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_no',
        'purchase_date',
        'supplier_name',
        'total_amount',
        'payment_status'
    ];

    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }
}
