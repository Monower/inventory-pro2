<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $mainBranchId = DB::table('branches')->where('code', 'MAIN')->value('id');

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('phone')->constrained('branches')->nullOnDelete();
        });

        if ($mainBranchId) {
            DB::table('users')->whereNull('branch_id')->update([
                'branch_id' => $mainBranchId,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });
    }
};
