<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Attribute;
use App\Models\AttributeValue;

class Product extends Model
{
    protected $fillable = [
        'name',
        'selling_price',
        'buying_price',
        'stock',
        'sub_category_id',
        'unit',
        'description',
        'product_image',
    ];

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }

    public function category()
    {
        return $this->hasOneThrough(Category::class, SubCategory::class, 'id', 'id', 'sub_category_id', 'category_id');
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'attribute_product')
                    ->withPivot('attribute_value_id')
                    ->withTimestamps();
    }

    public function attributeValues()
    {
        return $this->belongsToMany(AttributeValue::class, 'attribute_product')
                    ->withPivot('attribute_id')
                    ->withTimestamps();
    }
}
