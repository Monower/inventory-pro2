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

    public function resolveVariant(?int $variantId = null): ?ProductVariant
    {
        if ($variantId) {
            return $this->variants()->whereKey($variantId)->first();
        }

        return $this->variants()->whereNull('attribute_value_id')->first()
            ?? $this->variants()->orderBy('id')->first();
    }

    public function syncStockFromVariants(): void
    {
        $variants = $this->variants()->get();
        $totalStock = (int) $variants->sum('stock');
        $weightedBuyingPrice = null;

        if ($totalStock > 0) {
            $weightedCost = $variants->sum(function ($variant) {
                $cost = $variant->average_cost ?? $variant->buying_price ?? 0;

                return (float) $cost * (int) $variant->stock;
            });

            $weightedBuyingPrice = $weightedCost / $totalStock;
        } else {
            $firstVariant = $variants->first();
            $weightedBuyingPrice = $firstVariant?->average_cost ?? $firstVariant?->buying_price;
        }

        $this->forceFill([
            'stock' => $totalStock,
            'attribute_value_id' => $this->variants()->value('attribute_value_id'),
            'buying_price' => $weightedBuyingPrice ?? $this->buying_price,
        ])->save();
    }

    public function incrementVariantlessStock(int $quantity): void
    {
        $variant = $this->resolveVariant();

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

    public function incrementStockForVariant(?int $variantId, int $quantity): void
    {
        $variant = $this->resolveVariant($variantId);

        if (!$variant) {
            throw new \RuntimeException("Stock variant is missing for {$this->name}");
        }

        $variant->incrementStock($quantity);
    }

    public function decrementStockForVariant(?int $variantId, int $quantity): void
    {
        $variant = $this->resolveVariant($variantId);

        if (!$variant) {
            throw new \RuntimeException("Stock variant is missing for {$this->name}");
        }

        $variant->decrementStock($quantity);
    }
}
