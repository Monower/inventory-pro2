<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('units')) {
            Schema::table('units', function (Blueprint $table): void {
                if (!Schema::hasColumn('units', 'tenant_id')) {
                    $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                }

                if (!Schema::hasColumn('units', 'name')) {
                    $table->string('name')->after('tenant_id');
                }

                if (!Schema::hasColumn('units', 'symbol')) {
                    $table->string('symbol')->nullable()->after('name');
                }

                if (!Schema::hasColumn('units', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('symbol');
                }

                if (!Schema::hasColumn('units', 'created_at')) {
                    $table->timestamps();
                }
            });

            return;
        }

        Schema::create('units', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('symbol')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
