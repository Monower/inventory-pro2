<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BranchProductInventory extends Model
{
    protected $fillable = [
        'branch_id',
        'product_id',
        'stock',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
