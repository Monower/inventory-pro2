<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdvanceSalary extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id', 'amount', 'installments', 'installment_amount',
        'remaining_amount', 'start_month', 'months_adjusted', 'status'
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}

