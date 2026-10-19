<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_fraud_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('review_type', 64);
            $table->string('status', 32)->default('open');
            $table->string('subject_type', 64)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->text('summary');
            $table->json('metadata')->nullable();
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['status', 'review_type']);
        });

        Schema::create('security_account_restrictions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('restriction_type', 32);
            $table->text('reason');
            $table->string('status', 32)->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('authorized_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('security_incidents', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('severity', 16)->default('medium');
            $table->string('status', 32)->default('open');
            $table->text('summary');
            $table->text('containment_actions')->nullable();
            $table->text('recovery_notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('security_policy_exceptions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('policy_key', 128);
            $table->text('reason');
            $table->string('status', 32)->default('active');
            $table->foreignId('authorized_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('security_rotation_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('credential_type', 64);
            $table->string('status', 32)->default('planned');
            $table->timestamp('due_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('completed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_rotation_tasks');
        Schema::dropIfExists('security_policy_exceptions');
        Schema::dropIfExists('security_incidents');
        Schema::dropIfExists('security_account_restrictions');
        Schema::dropIfExists('security_fraud_reviews');
    }
};
