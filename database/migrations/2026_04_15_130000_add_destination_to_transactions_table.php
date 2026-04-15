<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('destination')->nullable()->after('source');
        });

        DB::table('transactions')
            ->where('transaction_type', 'expense')
            ->whereNull('destination')
            ->update([
                'destination' => DB::raw('source'),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('transactions')
            ->where('transaction_type', 'expense')
            ->where(function ($query) {
                $query->whereNull('source')->orWhere('source', '');
            })
            ->whereNotNull('destination')
            ->update([
                'source' => DB::raw('destination'),
            ]);

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('destination');
        });
    }
};
