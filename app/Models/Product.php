<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

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

    public function stockLedgers()
    {
        return $this->hasMany(StockLedger::class);
    }

    public function branchInventories()
    {
        return $this->hasMany(BranchProductInventory::class);
    }

    public function stockTransferItems()
    {
        return $this->hasMany(StockTransferItem::class);
    }

    public function refreshStockTotals(): void
    {
        $branchStock = (int) $this->branchInventories()->sum('stock');
        $inTransitStock = 0;

        if (Schema::hasTable('stock_transfers') && Schema::hasTable('stock_transfer_items')) {
            $inTransitStock = (int) StockTransferItem::query()
                ->join('stock_transfers', 'stock_transfers.id', '=', 'stock_transfer_items.stock_transfer_id')
                ->where('stock_transfer_items.product_id', $this->id)
                ->where('stock_transfers.status', 'in_transit')
                ->sum('stock_transfer_items.approved_quantity');
        }

        $this->update([
            'stock' => $branchStock + $inTransitStock,
        ]);
    }
}
