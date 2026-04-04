<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('product_variant_id')
                ->nullable()
                ->after('product_id')
                ->constrained('product_variants')
                ->nullOnDelete();
        });

        $fallbackVariantIds = DB::table('product_variants')
            ->select('id', 'product_id', 'attribute_value_id')
            ->orderBy('id')
            ->get()
            ->groupBy('product_id')
            ->map(function ($variants) {
                $variantless = $variants->firstWhere('attribute_value_id', null);

                return $variantless->id ?? $variants->first()?->id;
            });

        DB::table('order_items')
            ->select('id', 'product_id')
            ->orderBy('id')
            ->chunkById(100, function ($items) use ($fallbackVariantIds) {
                foreach ($items as $item) {
                    $variantId = $fallbackVariantIds[$item->product_id] ?? null;

                    if ($variantId) {
                        DB::table('order_items')
                            ->where('id', $item->id)
                            ->update(['product_variant_id' => $variantId]);
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_variant_id']);
            $table->dropColumn('product_variant_id');
        });
    }
};
