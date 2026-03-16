<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('orders:rollout-check', function () {
    $requiredTables = [
        'orders',
        'order_payments',
        'order_refunds',
        'order_refund_items',
        'order_refund_exchange_items',
        'order_activity_logs',
        'stock_ledgers',
        'coupons',
    ];

    $requiredOrderColumns = [
        'order_status',
        'fulfillment_status',
        'invoice_number',
        'salesperson_staff_id',
        'branch_name',
        'shipping_address',
        'shipping_charge',
        'courier_name',
        'tracking_number',
        'coupon_id',
        'manual_discount_amount',
        'coupon_discount_amount',
        'coupon_code',
        'discount_amount',
        'tax_rate',
        'tax_amount',
    ];

    $requiredPermissions = [
        'refund order',
        'approve refund case',
        'reject refund case',
        'collect order payment',
        'change order status',
        'manage order fulfillment',
        'print order invoice',
        'view coupon',
        'create coupon',
        'edit coupon',
        'delete coupon',
        'view stock ledger',
    ];

    $this->info('Checking order rollout readiness...');

    foreach ($requiredTables as $table) {
        $exists = Schema::hasTable($table);
        $this->line(($exists ? '[OK] ' : '[MISSING] ') . "table: {$table}");
    }

    foreach ($requiredOrderColumns as $column) {
        $exists = Schema::hasColumn('orders', $column);
        $this->line(($exists ? '[OK] ' : '[MISSING] ') . "orders.{$column}");
    }

    foreach ($requiredPermissions as $permissionName) {
        $exists = Schema::hasTable('permissions')
            ? Permission::query()->where('name', $permissionName)->exists()
            : false;
        $this->line(($exists ? '[OK] ' : '[MISSING] ') . "permission: {$permissionName}");
    }
})->purpose('Validate the Phase 1-4 order rollout schema and permission surface');
