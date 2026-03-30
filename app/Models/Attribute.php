<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'name',
        'tenant_id',
    ];

    // Each Attribute has many AttributeValues
    public function values()
    {
        return $this->hasMany(AttributeValue::class);
    }
}
