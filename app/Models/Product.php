<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'attribute_id',
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

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
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

    public function ensureVariantlessVariant(array $attributes = []): ProductVariant
    {
        $variant = $this->variants()->whereNull('attribute_value_id')->first();

        if ($variant) {
            if ($attributes !== []) {
                $variant->fill($attributes)->save();
            }

            return $variant;
        }

        return $this->variants()->create(array_merge([
            'attribute_value_id' => null,
            'buying_price' => $this->buying_price,
            'average_cost' => $this->buying_price,
            'selling_price' => $this->selling_price,
            'stock' => 0,
        ], $attributes));
    }

    public function syncStockFromVariants(): void
    {
        $variants = $this->variants()->get();
        $totalStock = (int) $variants->sum('stock');
        $weightedBuyingPrice = null;
        $defaultSellingPrice = null;

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

        $defaultSellingPrice = $variants->firstWhere('attribute_value_id', null)?->selling_price
            ?? $variants->first()?->selling_price
            ?? $this->selling_price;

        $this->forceFill([
            'stock' => $totalStock,
            'attribute_value_id' => $this->variants()->value('attribute_value_id'),
            'buying_price' => $weightedBuyingPrice ?? $this->buying_price,
            'selling_price' => $defaultSellingPrice,
        ])->save();
    }

    public function incrementVariantlessStock(int $quantity): void
    {
        $variant = $this->ensureVariantlessVariant();

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
