<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id', 'month', 'basic_salary', 'bonus', 'deductions',
        'advance_deduction', 'net_salary', 'is_paid', 'paid_at'
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
