<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdvanceSalary extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id', 'amount', 'remaining_amount', 'status'
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
