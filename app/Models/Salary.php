<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Salary extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'staff_id', 'month', 'basic_salary', 'bonus', 'deductions',
        'net_salary', 'is_paid', 'paid_at', 'tenant_id'
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
