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

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function syncStockFromVariants(): void
    {
        $totalStock = (int) $this->variants()->sum('stock');

        $this->forceFill([
            'stock' => $totalStock,
            'attribute_value_id' => $this->variants()->value('attribute_value_id'),
        ])->save();
    }

    public function incrementVariantlessStock(int $quantity): void
    {
        $variant = $this->variants()->whereNull('attribute_value_id')->first();

        if (!$variant) {
            $variant = $this->variants()->orderBy('id')->first();
        }

        if (!$variant) {
            $variant = $this->variants()->create([
                'attribute_value_id' => null,
                'stock' => 0,
            ]);
        }

        $variant->increment('stock', $quantity);
        $this->syncStockFromVariants();
    }

    public function decrementVariantlessStock(int $quantity): void
    {
        $variant = $this->variants()->whereNull('attribute_value_id')->first();

        if ($variant) {
            $variant->decrement('stock', $quantity);
            $this->syncStockFromVariants();
            return;
        }

        $remaining = $quantity;
        $variants = $this->variants()->orderBy('id')->get();

        foreach ($variants as $stockVariant) {
            if ($remaining <= 0) {
                break;
            }

            if ($stockVariant->stock <= 0) {
                continue;
            }

            $deduction = min($stockVariant->stock, $remaining);
            $stockVariant->decrement('stock', $deduction);
            $remaining -= $deduction;
        }

        $this->syncStockFromVariants();
    }
}
