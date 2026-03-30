<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdvanceSalary extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'staff_id', 'amount', 'installments', 'installment_amount',
        'remaining_amount', 'start_month', 'months_adjusted', 'status', 'tenant_id'
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
