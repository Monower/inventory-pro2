<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('buying_price', 10, 2)->nullable()->after('attribute_value_id');
            $table->decimal('selling_price', 10, 2)->nullable()->after('buying_price');
        });

        DB::table('product_variants')
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->update([
                'product_variants.buying_price' => DB::raw('products.buying_price'),
                'product_variants.selling_price' => DB::raw('products.selling_price'),
            ]);
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['buying_price', 'selling_price']);
        });
    }
};
