<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['attribute_value_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('attribute_value_id')->nullable()->change();
            $table->foreign('attribute_value_id')->references('id')->on('attribute_values')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['attribute_value_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('attribute_value_id')->nullable(false)->change();
            $table->foreign('attribute_value_id')->references('id')->on('attribute_values')->cascadeOnDelete();
        });
    }
};
