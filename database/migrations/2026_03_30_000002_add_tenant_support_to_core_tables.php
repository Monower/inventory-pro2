<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    protected array $tables = [
        'users',
        'categories',
        'sub_categories',
        'customers',
        'staff',
        'transactions',
        'banks',
        'attributes',
        'attribute_values',
        'products',
        'orders',
        'order_items',
        'settings',
        'purchases',
        'purchase_items',
        'salaries',
        'advance_salaries',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $table): void {
                $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            });
        }

        $companyName = DB::table('settings')->where('name', 'company_name')->value('value') ?: 'Default Tenant';
        $slugBase = Str::slug($companyName) ?: 'default-tenant';
        $slug = $slugBase;
        $suffix = 1;

        while (DB::table('tenants')->where('slug', $slug)->exists()) {
            $suffix++;
            $slug = "{$slugBase}-{$suffix}";
        }

        $tenantId = DB::table('tenants')->insertGetId([
            'name' => $companyName,
            'slug' => $slug,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($this->tables as $table) {
            DB::table($table)->whereNull('tenant_id')->update(['tenant_id' => $tenantId]);
        }

        Schema::table('customers', function (Blueprint $table): void {
            $table->dropUnique('customers_email_unique');
            $table->dropUnique('customers_phone_unique');
            $table->unique(['tenant_id', 'email']);
            $table->unique(['tenant_id', 'phone']);
        });

        Schema::table('staff', function (Blueprint $table): void {
            $table->dropUnique('staff_email_unique');
            $table->dropUnique('staff_phone_unique');
            $table->unique(['tenant_id', 'email']);
            $table->unique(['tenant_id', 'phone']);
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropUnique('orders_order_number_unique');
            $table->unique(['tenant_id', 'order_number']);
        });

        Schema::table('purchases', function (Blueprint $table): void {
            $table->dropUnique('purchases_invoice_no_unique');
            $table->unique(['tenant_id', 'invoice_no']);
        });

        Schema::table('settings', function (Blueprint $table): void {
            $table->unique(['tenant_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table): void {
            $table->dropUnique(['tenant_id', 'name']);
        });

        Schema::table('purchases', function (Blueprint $table): void {
            $table->dropUnique(['tenant_id', 'invoice_no']);
            $table->unique('invoice_no');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropUnique(['tenant_id', 'order_number']);
            $table->unique('order_number');
        });

        Schema::table('staff', function (Blueprint $table): void {
            $table->dropUnique(['tenant_id', 'email']);
            $table->dropUnique(['tenant_id', 'phone']);
            $table->unique('email');
            $table->unique('phone');
        });

        Schema::table('customers', function (Blueprint $table): void {
            $table->dropUnique(['tenant_id', 'email']);
            $table->dropUnique(['tenant_id', 'phone']);
            $table->unique('email');
            $table->unique('phone');
        });

        foreach (array_reverse($this->tables) as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropConstrainedForeignId('tenant_id');
            });
        }
    }
};
