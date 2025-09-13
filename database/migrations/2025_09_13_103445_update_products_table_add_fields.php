<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'selling_price')) {
                $table->decimal('selling_price', 10, 2)->after('name');
            }
            if (!Schema::hasColumn('products', 'buying_price')) {
                $table->decimal('buying_price', 10, 2)->after('selling_price');
            }
            if (!Schema::hasColumn('products', 'stock')) {
                $table->integer('stock')->default(0)->after('buying_price');
            }
            if (!Schema::hasColumn('products', 'unit')) {
                $table->string('unit')->nullable()->after('stock');
            }
            if (!Schema::hasColumn('products', 'product_image')) {
                $table->string('product_image')->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['selling_price', 'buying_price', 'stock', 'unit', 'product_image']);
        });
    }
};
