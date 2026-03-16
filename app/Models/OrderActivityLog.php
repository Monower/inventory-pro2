<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderActivityLog extends Model
{
    protected $fillable = [
        'order_id',
        'event_type',
        'title',
        'description',
        'meta',
        'causer_id',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function causer()
    {
        return $this->belongsTo(Staff::class, 'causer_id');
    }
}
