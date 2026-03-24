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
        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->string('license_key')->nullable();
            $table->string('licensed_email')->nullable();
            $table->string('plan')->nullable();
            $table->string('status')->default('not_activated');
            $table->string('machine_fingerprint')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('last_validated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('last_validation_error')->nullable();
            $table->json('features')->nullable();
            $table->json('meta')->nullable();
            $table->text('payload_signature')->nullable();
            $table->json('payload_data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
