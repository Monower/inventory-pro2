<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE customers MODIFY email VARCHAR(255) NULL');

        DB::table('customers')
            ->where('email', '')
            ->update(['email' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE customers SET email = CONCAT('customer+', id, '@placeholder.local') WHERE email IS NULL");

        DB::statement('ALTER TABLE customers MODIFY email VARCHAR(255) NOT NULL');
    }
};
