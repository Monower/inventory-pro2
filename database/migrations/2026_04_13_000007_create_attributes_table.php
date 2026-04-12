<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('attributes')) {
            Schema::table('attributes', function (Blueprint $table): void {
                if (!Schema::hasColumn('attributes', 'tenant_id')) {
                    $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                }

                if (!Schema::hasColumn('attributes', 'name')) {
                    $table->string('name')->after('tenant_id');
                }

                if (!Schema::hasColumn('attributes', 'values')) {
                    $table->json('values')->nullable()->after('name');
                }

                if (!Schema::hasColumn('attributes', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('values');
                }

                if (!Schema::hasColumn('attributes', 'created_at')) {
                    $table->timestamps();
                }
            });

            return;
        }

        Schema::create('attributes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->json('values')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attributes');
    }
};
