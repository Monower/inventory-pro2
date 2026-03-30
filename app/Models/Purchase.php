<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'invoice_no',
        'purchase_date',
        'supplier_name',
        'notes',
        'total_amount',
        'payment_status',
        'paid_amount',
        'tenant_id',
    ];

    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }
}
