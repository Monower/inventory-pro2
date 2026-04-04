<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'attribute_value_id',
        'buying_price',
        'average_cost',
        'selling_price',
        'stock',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attributeValue()
    {
        return $this->belongsTo(AttributeValue::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function incrementStock(int $quantity): void
    {
        $this->increment('stock', $quantity);
        $this->product?->syncStockFromVariants();
    }

    public function decrementStock(int $quantity): void
    {
        if ($this->stock < $quantity) {
            throw new \RuntimeException("Not enough stock for {$this->product?->name}");
        }

        $this->decrement('stock', $quantity);
        $this->product?->syncStockFromVariants();
    }

    public function syncCostFromPurchaseHistory(): void
    {
        $stats = $this->purchaseItems()
            ->selectRaw('COALESCE(SUM(quantity), 0) as total_quantity')
            ->selectRaw('COALESCE(SUM(quantity * buying_price), 0) as total_cost')
            ->first();

        $latestPurchasePrice = $this->purchaseItems()
            ->join('purchases', 'purchases.id', '=', 'purchase_items.purchase_id')
            ->where('purchase_items.product_variant_id', $this->id)
            ->orderByDesc('purchases.purchase_date')
            ->orderByDesc('purchase_items.id')
            ->value('purchase_items.buying_price');

        $averageCost = (float) ($this->average_cost ?? $this->buying_price ?? 0);

        if ((float) ($stats->total_quantity ?? 0) > 0) {
            $averageCost = (float) $stats->total_cost / (float) $stats->total_quantity;
        }

        $this->forceFill([
            'buying_price' => $latestPurchasePrice ?? $this->buying_price,
            'average_cost' => $averageCost,
        ])->save();

        $this->product?->syncStockFromVariants();
    }
}
