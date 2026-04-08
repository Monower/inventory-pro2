<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attribute_value_id')->nullable()->constrained('attribute_values')->nullOnDelete();
            $table->decimal('buying_price', 10, 2)->nullable();
            $table->decimal('average_cost', 10, 2)->nullable();
            $table->decimal('selling_price', 10, 2)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->timestamps();
        });

        $products = DB::table('products')
            ->select('id', 'attribute_value_id', 'buying_price', 'selling_price', 'stock', 'created_at', 'updated_at')
            ->get();

        $now = now();

        foreach ($products as $product) {
            DB::table('product_variants')->insert([
                'product_id' => $product->id,
                'attribute_value_id' => $product->attribute_value_id ?: null,
                'buying_price' => $product->buying_price,
                'average_cost' => $product->buying_price,
                'selling_price' => $product->selling_price,
                'stock' => max((int) $product->stock, 0),
                'created_at' => $product->created_at ?? $now,
                'updated_at' => $product->updated_at ?? $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
