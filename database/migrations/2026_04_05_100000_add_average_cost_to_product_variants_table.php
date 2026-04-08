<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('product_variants', 'average_cost')) {
            Schema::table('product_variants', function (Blueprint $table) {
                $table->decimal('average_cost', 10, 2)->nullable()->after('buying_price');
            });
        }

        DB::table('product_variants')
            ->update([
                'average_cost' => DB::raw('COALESCE(buying_price, 0)'),
            ]);
    }

    public function down(): void
    {
        if (Schema::hasColumn('product_variants', 'average_cost')) {
            Schema::table('product_variants', function (Blueprint $table) {
                $table->dropColumn('average_cost');
            });
        }
    }
};
