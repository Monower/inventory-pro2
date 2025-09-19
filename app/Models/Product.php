<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'selling_price',
        'buying_price',
        'stock',
        'unit',
        'description',
        'product_image',
        'sub_category_id',
        'attribute_value_id',
    ];

    // Relationships

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function attributeValue()
    {
        return $this->belongsTo(AttributeValue::class);
    }
}
