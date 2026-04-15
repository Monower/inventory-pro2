<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('advance_salaries', function (Blueprint $table) {
            $table->dropColumn([
                'installments',
                'installment_amount',
                'start_month',
                'months_adjusted',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('advance_salaries', function (Blueprint $table) {
            $table->integer('installments')->default(1)->after('amount');
            $table->decimal('installment_amount', 10, 2)->default(0)->after('installments');
            $table->string('start_month')->nullable()->after('remaining_amount');
            $table->integer('months_adjusted')->default(0)->after('start_month');
        });
    }
};
