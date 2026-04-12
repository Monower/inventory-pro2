<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('categories')) {
            Schema::table('categories', function (Blueprint $table): void {
                if (!Schema::hasColumn('categories', 'tenant_id')) {
                    $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                }

                if (!Schema::hasColumn('categories', 'parent_id')) {
                    $table->foreignId('parent_id')->nullable()->after('tenant_id')->constrained('categories')->cascadeOnDelete();
                }

                if (!Schema::hasColumn('categories', 'slug')) {
                    $table->string('slug')->nullable()->after('name');
                }

                if (!Schema::hasColumn('categories', 'description')) {
                    $table->text('description')->nullable()->after('slug');
                }

                if (!Schema::hasColumn('categories', 'image_path')) {
                    $table->string('image_path')->nullable()->after('description');
                }

                if (!Schema::hasColumn('categories', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('image_path');
                }

                if (!Schema::hasColumn('categories', 'created_at')) {
                    $table->timestamps();
                }
            });

            $tenantId = DB::table('tenants')->value('id');

            if ($tenantId && Schema::hasColumn('categories', 'tenant_id')) {
                DB::table('categories')->whereNull('tenant_id')->update(['tenant_id' => $tenantId]);
            }

            if (Schema::hasColumn('categories', 'slug')) {
                DB::table('categories')
                    ->whereNull('slug')
                    ->orWhere('slug', '')
                    ->orderBy('id')
                    ->get(['id', 'name'])
                    ->each(function ($category): void {
                        $baseSlug = Str::slug($category->name) ?: "category-{$category->id}";
                        $slug = $baseSlug;
                        $suffix = 1;

                        while (DB::table('categories')->where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                            $suffix++;
                            $slug = "{$baseSlug}-{$suffix}";
                        }

                        DB::table('categories')->where('id', $category->id)->update(['slug' => $slug]);
                    });
            }

            return;
        }

        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'slug']);
            $table->index(['tenant_id', 'parent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
