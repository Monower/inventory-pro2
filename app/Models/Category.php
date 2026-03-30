<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use BelongsToTenant;

    protected $table = 'categories';

    protected $fillable = ['name', 'tenant_id'];


    public function subCategories()
    {
        return $this->hasMany(SubCategory::class);
    }
}
