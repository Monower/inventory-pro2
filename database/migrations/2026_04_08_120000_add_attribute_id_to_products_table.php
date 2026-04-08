<?php

use App\Models\AttributeValue;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('products', 'attribute_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->foreignId('attribute_id')
                    ->nullable()
                    ->after('sub_category_id')
                    ->constrained('attributes')
                    ->nullOnDelete();
            });
        }

        $attributeIds = DB::table('products')
            ->leftJoin('product_variants', 'product_variants.product_id', '=', 'products.id')
            ->whereNotNull('product_variants.attribute_value_id')
            ->select('products.id', 'product_variants.attribute_value_id')
            ->get()
            ->mapWithKeys(function ($row) {
                $attributeId = AttributeValue::whereKey($row->attribute_value_id)->value('attribute_id');

                return $attributeId ? [$row->id => $attributeId] : [];
            });

        foreach ($attributeIds as $productId => $attributeId) {
            DB::table('products')
                ->where('id', $productId)
                ->update(['attribute_id' => $attributeId]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'attribute_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropConstrainedForeignId('attribute_id');
            });
        }
    }
};
