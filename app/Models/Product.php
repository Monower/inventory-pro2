<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }

    // Optional: access parent category via sub-category
    public function category()
    {
        return $this->hasOneThrough(Category::class, SubCategory::class, 'id', 'id', 'sub_category_id', 'category_id');
    }

    protected $fillable = [
        'name',
        'description',
        'price',
        'sub_category_id',
    ];
}
