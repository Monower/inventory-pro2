<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $mainBranchId = DB::table('branches')->where('code', 'MAIN')->value('id');
        $mainBranchName = DB::table('branches')->where('code', 'MAIN')->value('name') ?? 'Main Branch';

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('salesperson_staff_id')->constrained('branches')->nullOnDelete();
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('supplier_name')->constrained('branches')->nullOnDelete();
        });

        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('product_id')->constrained('branches')->nullOnDelete();
        });

        if ($mainBranchId) {
            DB::table('orders')->whereNull('branch_id')->update([
                'branch_id' => $mainBranchId,
                'branch_name' => DB::raw("COALESCE(branch_name, '{$mainBranchName}')"),
            ]);

            DB::table('purchases')->whereNull('branch_id')->update([
                'branch_id' => $mainBranchId,
            ]);

            DB::table('stock_ledgers')->whereNull('branch_id')->update([
                'branch_id' => $mainBranchId,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });
    }
};
