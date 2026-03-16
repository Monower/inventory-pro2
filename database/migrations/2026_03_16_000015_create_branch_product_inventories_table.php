<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_product_inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->integer('stock')->default(0);
            $table->timestamps();

            $table->unique(['branch_id', 'product_id']);
        });

        $mainBranchId = DB::table('branches')->where('code', 'MAIN')->value('id');

        if ($mainBranchId) {
            $products = DB::table('products')->select('id', 'stock')->get();

            foreach ($products as $product) {
                DB::table('branch_product_inventories')->insert([
                    'branch_id' => $mainBranchId,
                    'product_id' => $product->id,
                    'stock' => (int) $product->stock,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_product_inventories');
    }
};
