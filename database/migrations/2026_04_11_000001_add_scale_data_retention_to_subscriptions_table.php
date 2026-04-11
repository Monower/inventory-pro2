<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            if (!Schema::hasColumn('subscriptions', 'scale_data_retention_started_at')) {
                $table->timestamp('scale_data_retention_started_at')->nullable()->after('scheduled_change_type');
            }

            if (!Schema::hasColumn('subscriptions', 'scale_data_retained_until')) {
                $table->timestamp('scale_data_retained_until')->nullable()->after('scale_data_retention_started_at');
            }
        });

        DB::table('plans')
            ->whereIn('slug', ['starter', 'growth', 'scale'])
            ->update(['trial_days' => 3]);
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('subscriptions', 'scale_data_retained_until')) {
                $table->dropColumn('scale_data_retained_until');
            }

            if (Schema::hasColumn('subscriptions', 'scale_data_retention_started_at')) {
                $table->dropColumn('scale_data_retention_started_at');
            }
        });

        DB::table('plans')
            ->whereIn('slug', ['starter', 'growth', 'scale'])
            ->update(['trial_days' => 14]);
    }
};
