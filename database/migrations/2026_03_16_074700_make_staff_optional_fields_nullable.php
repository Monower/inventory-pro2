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
        Schema::table('staff', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->decimal('salary', 10, 2)->nullable()->change();
            $table->string('address')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
            $table->decimal('salary', 10, 2)->nullable(false)->default(0.00)->change();
            $table->string('address')->nullable(false)->change();
        });
    }
};
