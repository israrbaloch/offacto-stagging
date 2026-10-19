<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('subject');
            $table->text('description')->nullable();
            $table->string('status', 32)->default('open');
            $table->string('priority', 16)->default('normal');
            $table->string('category', 64)->default('general');
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('sla_due_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['status', 'priority']);
        });

        Schema::create('support_ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('body');
            $table->boolean('is_internal')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('support_access_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason');
            $table->string('scope', 64)->default('read_only_context');
            $table->string('status', 32)->default('pending');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('support_recovery_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 32)->default('intake');
            $table->string('verification_method', 64)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('handled_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('support_macros', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category', 64)->default('general');
            $table->text('body');
            $table->string('shortcut', 32)->nullable();
            $table->timestamps();
        });

        Schema::create('support_knowledge_articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 128)->unique();
            $table->string('title');
            $table->string('category', 64)->default('guide');
            $table->longText('body');
            $table->boolean('published')->default(true);
            $table->timestamps();
        });

        Schema::create('customer_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('feedback_type', 32);
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('body')->nullable();
            $table->string('status', 32)->default('new');
            $table->timestamps();
        });

        Schema::create('support_escalations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_ticket_id')->nullable()->constrained()->nullOnDelete();
            $table->string('escalation_type', 64);
            $table->string('status', 32)->default('open');
            $table->string('assigned_team', 64);
            $table->text('summary');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_escalations');
        Schema::dropIfExists('customer_feedback');
        Schema::dropIfExists('support_knowledge_articles');
        Schema::dropIfExists('support_macros');
        Schema::dropIfExists('support_recovery_requests');
        Schema::dropIfExists('support_access_requests');
        Schema::dropIfExists('support_ticket_messages');
        Schema::dropIfExists('support_tickets');
    }
};
