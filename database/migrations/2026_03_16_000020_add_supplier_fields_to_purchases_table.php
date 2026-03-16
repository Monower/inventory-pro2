<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->after('supplier_name')->constrained('suppliers')->nullOnDelete();
            $table->decimal('due_amount', 12, 2)->default(0)->after('paid_amount');
        });

        $names = DB::table('purchases')
            ->whereNotNull('supplier_name')
            ->select('supplier_name')
            ->distinct()
            ->pluck('supplier_name');

        foreach ($names as $name) {
            if (!trim((string) $name) || strtolower(trim((string) $name)) === 'unknown') {
                continue;
            }

            $supplierId = DB::table('suppliers')->insertGetId([
                'name' => $name,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('purchases')
                ->where('supplier_name', $name)
                ->update(['supplier_id' => $supplierId]);
        }

        DB::table('purchases')->update([
            'due_amount' => DB::raw('GREATEST(total_amount - paid_amount, 0)'),
        ]);

        $existingPurchases = DB::table('purchases')
            ->where('paid_amount', '>', 0)
            ->get();

        foreach ($existingPurchases as $purchase) {
            if (!$purchase->supplier_id) {
                continue;
            }

            DB::table('supplier_payments')->insert([
                'supplier_id' => $purchase->supplier_id,
                'purchase_id' => $purchase->id,
                'branch_id' => $purchase->branch_id,
                'payment_number' => 'SPY-' . Str::upper(Str::random(8)),
                'paid_at' => $purchase->created_at ?? now(),
                'amount' => $purchase->paid_amount,
                'payment_method' => 'cash',
                'notes' => 'Backfilled from existing purchase payment.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropConstrainedForeignId('supplier_id');
            $table->dropColumn('due_amount');
        });
    }
};
