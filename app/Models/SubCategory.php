<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class SubCategory extends Model
{
    use BelongsToTenant;

    protected $table = 'sub_categories';

    protected $fillable = [
        'name',
        'category_id',
        'tenant_id',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
