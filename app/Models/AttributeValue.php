<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttributeValue extends Model
{
    use HasFactory;

    protected $fillable = ['attribute_id', 'value'];

    // Belongs to an Attribute
    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    // Products connected via pivot
    public function products()
    {
        return $this->belongsToMany(Product::class, 'attribute_product')
                    ->withPivot('attribute_id')
                    ->withTimestamps();
    }
}
