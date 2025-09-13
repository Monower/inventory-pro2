<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attribute extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    // Each Attribute can have many values
    public function values()
    {
        return $this->hasMany(AttributeValue::class);
    }

    // If products are linked via pivot
    public function products()
    {
        return $this->belongsToMany(Product::class, 'attribute_product')
                    ->withPivot('attribute_value_id')
                    ->withTimestamps();
    }
}
