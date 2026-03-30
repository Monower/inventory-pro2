<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('monthly_price', 10, 2);
            $table->decimal('yearly_price', 10, 2);
            $table->unsignedInteger('trial_days')->default(14);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
            $table->string('status')->default('trial');
            $table->string('billing_cycle')->default('monthly');
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->boolean('cancel_at_period_end')->default(false);
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('next_plan_id')->nullable()->constrained('plans')->nullOnDelete();
            $table->string('next_billing_cycle')->nullable();
            $table->string('scheduled_change_type')->nullable();
            $table->timestamps();

            $table->unique('tenant_id');
        });

        Schema::create('subscription_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->constrained('subscriptions')->cascadeOnDelete();
            $table->string('event_type');
            $table->foreignId('old_plan_id')->nullable()->constrained('plans')->nullOnDelete();
            $table->foreignId('new_plan_id')->nullable()->constrained('plans')->nullOnDelete();
            $table->string('old_billing_cycle')->nullable();
            $table->string('new_billing_cycle')->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->decimal('credit_amount', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('effective_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_changes');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
    }
};
