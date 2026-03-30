<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttributeValue extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'name',
        'attribute_id',
        'tenant_id',
    ];

    // Each AttributeValue belongs to an Attribute
    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    // Products related to this attribute value
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
