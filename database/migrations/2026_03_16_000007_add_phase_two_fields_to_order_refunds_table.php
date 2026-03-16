<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->string('resolution_type')->default('refund')->after('refund_method');
            $table->decimal('replacement_total', 10, 2)->default(0)->after('total_amount');
            $table->string('workflow_status')->default('processed')->after('replacement_total');
        });
    }

    public function down(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->dropColumn(['resolution_type', 'replacement_total', 'workflow_status']);
        });
    }
};
