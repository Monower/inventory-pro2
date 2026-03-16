<?php

use App\Models\Staff;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->timestamp('email_verified_at')->nullable()->after('email');
            $table->string('password')->nullable()->after('phone');
            $table->foreignId('branch_id')->nullable()->after('password')->constrained('branches')->nullOnDelete();
            $table->string('avatar')->nullable()->after('branch_id');
            $table->rememberToken();
        });

        $userRows = DB::table('users')->get();
        $userToStaffMap = [];

        foreach ($userRows as $user) {
            $existingStaff = DB::table('staff')
                ->when($user->phone, fn ($query) => $query->where('phone', $user->phone))
                ->when(!$user->phone && $user->email, fn ($query) => $query->where('email', $user->email))
                ->first();

            if ($existingStaff) {
                DB::table('staff')
                    ->where('id', $existingStaff->id)
                    ->update([
                        'name' => $existingStaff->name ?: $user->name,
                        'email' => $existingStaff->email ?: $user->email,
                        'phone' => $existingStaff->phone ?: $user->phone,
                        'password' => $user->password,
                        'branch_id' => $user->branch_id ?? null,
                        'avatar' => $user->avatar ?? null,
                        'email_verified_at' => $user->email_verified_at,
                        'remember_token' => $user->remember_token,
                        'updated_at' => now(),
                    ]);

                $staffId = $existingStaff->id;
            } else {
                $staffId = DB::table('staff')->insertGetId([
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?: '9' . str_pad((string) $user->id, 10, '0', STR_PAD_LEFT),
                    'salary' => null,
                    'address' => null,
                    'password' => $user->password,
                    'branch_id' => $user->branch_id ?? null,
                    'avatar' => $user->avatar ?? null,
                    'email_verified_at' => $user->email_verified_at,
                    'remember_token' => $user->remember_token,
                    'created_at' => $user->created_at ?? now(),
                    'updated_at' => $user->updated_at ?? now(),
                ]);
            }

            $userToStaffMap[(int) $user->id] = (int) $staffId;
        }

        foreach ($userToStaffMap as $userId => $staffId) {
            DB::table('sessions')->where('user_id', $userId)->update(['user_id' => $staffId]);
            DB::table('supplier_payments')->where('received_by', $userId)->update(['received_by' => $staffId]);
            DB::table('stock_ledgers')->where('causer_id', $userId)->update(['causer_id' => $staffId]);
            DB::table('order_activity_logs')->where('causer_id', $userId)->update(['causer_id' => $staffId]);
            DB::table('order_payments')->where('received_by', $userId)->update(['received_by' => $staffId]);
            DB::table('order_refunds')->where('processed_by', $userId)->update(['processed_by' => $staffId]);
            DB::table('order_refunds')->where('reviewed_by', $userId)->update(['reviewed_by' => $staffId]);
            DB::table('stock_transfers')->where('requested_by', $userId)->update(['requested_by' => $staffId]);
            DB::table('stock_transfers')->where('approved_by', $userId)->update(['approved_by' => $staffId]);
            DB::table('stock_transfers')->where('dispatched_by', $userId)->update(['dispatched_by' => $staffId]);
            DB::table('stock_transfers')->where('received_by', $userId)->update(['received_by' => $staffId]);

            $userRoles = DB::table('model_has_roles')
                ->where('model_type', 'App\\Models\\User')
                ->where('model_id', $userId)
                ->get();

            foreach ($userRoles as $userRole) {
                DB::table('model_has_roles')->updateOrInsert([
                    'role_id' => $userRole->role_id,
                    'model_type' => 'App\\Models\\Staff',
                    'model_id' => $staffId,
                ], []);
            }

            DB::table('model_has_roles')
                ->where('model_type', 'App\\Models\\User')
                ->where('model_id', $userId)
                ->delete();

            $userPermissions = DB::table('model_has_permissions')
                ->where('model_type', 'App\\Models\\User')
                ->where('model_id', $userId)
                ->get();

            foreach ($userPermissions as $userPermission) {
                DB::table('model_has_permissions')->updateOrInsert([
                    'permission_id' => $userPermission->permission_id,
                    'model_type' => 'App\\Models\\Staff',
                    'model_id' => $staffId,
                ], []);
            }

            DB::table('model_has_permissions')
                ->where('model_type', 'App\\Models\\User')
                ->where('model_id', $userId)
                ->delete();
        }

        Schema::table('supplier_payments', function (Blueprint $table) {
            $table->dropForeign(['received_by']);
            $table->foreign('received_by')->references('id')->on('staff')->nullOnDelete();
        });

        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->dropForeign(['causer_id']);
            $table->foreign('causer_id')->references('id')->on('staff')->nullOnDelete();
        });

        Schema::table('order_activity_logs', function (Blueprint $table) {
            $table->dropForeign(['causer_id']);
            $table->foreign('causer_id')->references('id')->on('staff')->nullOnDelete();
        });

        Schema::table('order_payments', function (Blueprint $table) {
            $table->dropForeign(['received_by']);
            $table->foreign('received_by')->references('id')->on('staff')->nullOnDelete();
        });

        Schema::table('order_refunds', function (Blueprint $table) {
            $table->dropForeign(['processed_by']);
            $table->dropForeign(['reviewed_by']);
            $table->foreign('processed_by')->references('id')->on('staff')->nullOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('staff')->nullOnDelete();
        });

        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->dropForeign(['requested_by']);
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['dispatched_by']);
            $table->dropForeign(['received_by']);
            $table->foreign('requested_by')->references('id')->on('staff')->nullOnDelete();
            $table->foreign('approved_by')->references('id')->on('staff')->nullOnDelete();
            $table->foreign('dispatched_by')->references('id')->on('staff')->nullOnDelete();
            $table->foreign('received_by')->references('id')->on('staff')->nullOnDelete();
        });

        DB::table('roles')->where('name', 'admin')->update(['name' => 'super admin']);
        DB::table('roles')->where('name', 'user')->update(['name' => 'staff']);
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
            $table->dropColumn([
                'email_verified_at',
                'password',
                'avatar',
                'remember_token',
            ]);
        });
    }
};
