<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table): void {
                if (!Schema::hasColumn('products', 'tenant_id')) {
                    $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                }

                if (!Schema::hasColumn('products', 'category_id')) {
                    $table->foreignId('category_id')->nullable()->after('tenant_id')->constrained('categories')->nullOnDelete();
                }

                if (!Schema::hasColumn('products', 'sub_category_id')) {
                    $table->foreignId('sub_category_id')->nullable()->after('category_id')->constrained('categories')->nullOnDelete();
                }

                if (!Schema::hasColumn('products', 'unit_id')) {
                    $table->foreignId('unit_id')->nullable()->after('sub_category_id')->constrained('units')->nullOnDelete();
                }

                if (!Schema::hasColumn('products', 'slug')) {
                    $table->string('slug')->nullable()->after('name');
                }

                if (!Schema::hasColumn('products', 'image_path')) {
                    $table->string('image_path')->nullable()->after('slug');
                }

                if (!Schema::hasColumn('products', 'base_price')) {
                    $table->decimal('base_price', 12, 2)->default(0)->after('image_path');
                }

                if (!Schema::hasColumn('products', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('base_price');
                }

                if (!Schema::hasColumn('products', 'created_at')) {
                    $table->timestamps();
                }
            });

            return;
        }

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('sub_category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('image_path')->nullable();
            $table->decimal('base_price', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'slug']);
            $table->index(['tenant_id', 'category_id', 'sub_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
