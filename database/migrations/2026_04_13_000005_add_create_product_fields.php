<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (!Schema::hasColumn('products', 'description')) {
                $table->text('description')->nullable()->after('slug');
            }

            if (!Schema::hasColumn('products', 'cost_price')) {
                $table->decimal('cost_price', 12, 2)->default(0)->after('base_price');
            }

            if (!Schema::hasColumn('products', 'vat')) {
                $table->decimal('vat', 5, 2)->default(0)->after('cost_price');
            }

            if (!Schema::hasColumn('products', 'has_variants')) {
                $table->boolean('has_variants')->default(false)->after('vat');
            }

            if (!Schema::hasColumn('products', 'sku')) {
                $table->string('sku')->nullable()->after('has_variants');
            }

            if (!Schema::hasColumn('products', 'stock')) {
                $table->decimal('stock', 12, 2)->default(0)->after('sku');
            }

            if (!Schema::hasColumn('products', 'barcode')) {
                $table->string('barcode')->nullable()->after('stock');
            }
        });

        Schema::table('product_variants', function (Blueprint $table): void {
            if (!Schema::hasColumn('product_variants', 'cost_price')) {
                $table->decimal('cost_price', 12, 2)->default(0)->after('price');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table): void {
            if (Schema::hasColumn('product_variants', 'cost_price')) {
                $table->dropColumn('cost_price');
            }
        });

        Schema::table('products', function (Blueprint $table): void {
            foreach (['description', 'cost_price', 'vat', 'has_variants', 'sku', 'stock', 'barcode'] as $column) {
                if (Schema::hasColumn('products', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
