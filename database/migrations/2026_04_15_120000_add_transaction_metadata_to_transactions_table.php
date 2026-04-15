<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->date('transaction_date')->nullable()->after('name');
            $table->string('bank_name')->nullable()->after('amount');
            $table->string('branch_name')->nullable()->after('bank_name');
            $table->string('transaction_id')->nullable()->after('branch_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'transaction_date',
                'bank_name',
                'branch_name',
                'transaction_id',
            ]);
        });
    }
};
