<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('invoice_number')->unique()->nullable()->after('order_number');
            $table->foreignId('salesperson_staff_id')->nullable()->after('customer_id')->constrained('staff')->nullOnDelete();
            $table->string('branch_name')->nullable()->after('salesperson_staff_id');
            $table->text('shipping_address')->nullable()->after('branch_name');
            $table->decimal('shipping_charge', 10, 2)->default(0)->after('total_amount');
            $table->string('courier_name')->nullable()->after('shipping_charge');
            $table->string('tracking_number')->nullable()->after('courier_name');
            $table->string('fulfillment_status')->default('pending')->after('order_status');
            $table->timestamp('shipped_at')->nullable()->after('fulfillment_status');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('salesperson_staff_id');
            $table->dropColumn([
                'invoice_number',
                'branch_name',
                'shipping_address',
                'shipping_charge',
                'courier_name',
                'tracking_number',
                'fulfillment_status',
                'shipped_at',
                'delivered_at',
            ]);
        });
    }
};
