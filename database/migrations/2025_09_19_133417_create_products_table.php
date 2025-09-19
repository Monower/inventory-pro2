<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('selling_price', 10, 2);
            $table->decimal('buying_price', 10, 2);
            $table->integer('stock');
            $table->string('unit');
            $table->text('description')->nullable();
            $table->string('product_image')->nullable();
            $table->unsignedBigInteger('sub_category_id');
            $table->unsignedBigInteger('attribute_value_id');
            $table->timestamps();

            // Add foreign key constraints for existing tables
            $table->foreign('sub_category_id')->references('id')->on('sub_categories')->onDelete('cascade');
            $table->foreign('attribute_value_id')->references('id')->on('attribute_values')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
