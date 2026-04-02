<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->string('invoice_number')->nullable()->after('order_number');
            $table->string('payment_method')->default('cash')->after('payment_status');
            $table->foreignId('bank_id')->nullable()->after('payment_method')->constrained('banks')->nullOnDelete();
            $table->string('mfs')->nullable()->after('bank_id');
        });

        DB::table('orders')
            ->select(['id', 'order_number'])
            ->orderBy('id')
            ->chunkById(100, function ($orders): void {
                foreach ($orders as $order) {
                    DB::table('orders')
                        ->where('id', $order->id)
                        ->update([
                            'invoice_number' => 'INV-' . preg_replace('/[^A-Za-z0-9\-]/', '', (string) $order->order_number),
                            'payment_method' => 'cash',
                        ]);
                }
            });

        Schema::table('orders', function (Blueprint $table): void {
            $table->unique(['tenant_id', 'invoice_number']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropUnique(['tenant_id', 'invoice_number']);
            $table->dropConstrainedForeignId('bank_id');
            $table->dropColumn(['invoice_number', 'payment_method', 'mfs']);
        });
    }
};
