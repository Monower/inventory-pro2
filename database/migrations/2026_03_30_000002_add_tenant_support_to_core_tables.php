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
        'settings',
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

        Schema::table('settings', function (Blueprint $table): void {
            $table->unique(['tenant_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table): void {
            $table->dropUnique(['tenant_id', 'name']);
        });

        foreach (array_reverse($this->tables) as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropConstrainedForeignId('tenant_id');
            });
        }
    }
};
