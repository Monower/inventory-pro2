<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('coupon_id')->nullable()->after('coupon_code')->constrained('coupons')->nullOnDelete();
            $table->decimal('manual_discount_amount', 10, 2)->default(0)->after('coupon_id');
            $table->decimal('coupon_discount_amount', 10, 2)->default(0)->after('manual_discount_amount');
        });

        Schema::table('order_refunds', function (Blueprint $table) {
            $table->timestamp('reviewed_at')->nullable()->after('workflow_status');
            $table->foreignId('reviewed_by')->nullable()->after('reviewed_at')->constrained('users')->nullOnDelete();
            $table->text('workflow_notes')->nullable()->after('reviewed_by');
        });
    }

    public function down(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropColumn(['reviewed_at', 'workflow_notes']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('coupon_id');
            $table->dropColumn(['manual_discount_amount', 'coupon_discount_amount']);
        });
    }
};
