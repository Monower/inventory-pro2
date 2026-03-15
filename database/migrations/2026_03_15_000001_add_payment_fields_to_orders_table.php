<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method')->default('cash')->after('payment_status');
            $table->foreignId('bank_id')->nullable()->after('payment_method')->constrained('banks')->nullOnDelete();
            $table->string('mfs')->nullable()->after('bank_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bank_id');
            $table->dropColumn(['payment_method', 'mfs']);
        });
    }
};
