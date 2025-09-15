<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'selling_price',
        'buying_price',
        'stock',
        'unit',
        'description',
        'sub_category_id',
        'product_image',
    ];

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function attributes()
{
    return $this->belongsToMany(Attribute::class, 'attribute_product')
                ->withPivot('attribute_value_id')
                ->withTimestamps();
}

}
