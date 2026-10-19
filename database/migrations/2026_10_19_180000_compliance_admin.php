<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_legal_notices', function (Blueprint $table) {
            $table->id();
            $table->string('type', 32);
            $table->string('locale', 8)->default('en');
            $table->string('version_label', 64);
            $table->string('title');
            $table->longText('body');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('superseded_at')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['type', 'locale', 'published_at']);
        });

        Schema::create('compliance_consent_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->nullable();
            $table->string('consent_type', 64);
            $table->string('notice_version', 64)->nullable();
            $table->timestamp('accepted_at');
            $table->timestamp('withdrawn_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['consent_type', 'accepted_at']);
        });

        Schema::create('compliance_data_subject_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('request_type', 32);
            $table->string('status', 32)->default('received');
            $table->string('subject_email');
            $table->foreignId('subject_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('identity_verified_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['status', 'due_at']);
        });

        Schema::create('compliance_legal_holds', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('title');
            $table->text('scope_description');
            $table->string('status', 16)->default('active');
            $table->foreignId('authorized_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('placed_at');
            $table->timestamp('released_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('compliance_deletion_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('category', 64);
            $table->string('status', 32)->default('pending');
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('summary');
            $table->json('metadata')->nullable();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('compliance_breach_incidents', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('severity', 16)->default('medium');
            $table->string('status', 32)->default('open');
            $table->timestamp('discovered_at');
            $table->text('summary');
            $table->json('affected_categories')->nullable();
            $table->text('containment_actions')->nullable();
            $table->timestamp('notification_deadline_at')->nullable();
            $table->timestamp('notified_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('compliance_cases', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('case_type', 64);
            $table->string('title');
            $table->string('status', 32)->default('open');
            $table->boolean('restricted')->default(true);
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('compliance_authority_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('requesting_authority');
            $table->string('jurisdiction', 8)->default('BE');
            $table->text('legal_basis');
            $table->text('scope_summary');
            $table->string('status', 32)->default('received');
            $table->boolean('is_emergency')->default(false);
            $table->foreignId('assigned_reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('compliance_case_id')->nullable()->constrained('compliance_cases')->nullOnDelete();
            $table->timestamp('received_at');
            $table->timestamp('verified_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['status', 'is_emergency']);
        });

        Schema::create('compliance_disclosures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('authority_request_id')->constrained('compliance_authority_requests')->cascadeOnDelete();
            $table->foreignId('compliance_case_id')->nullable()->constrained('compliance_cases')->nullOnDelete();
            $table->string('disclosed_to');
            $table->text('scope_record');
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('disclosed_at');
            $table->string('customer_notification', 32)->default('not_applicable');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('compliance_evidence_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('authority_request_id')->nullable()->constrained('compliance_authority_requests')->cascadeOnDelete();
            $table->foreignId('compliance_case_id')->nullable()->constrained('compliance_cases')->nullOnDelete();
            $table->string('record_type', 64);
            $table->string('record_reference');
            $table->string('content_hash', 128)->nullable();
            $table->timestamp('captured_at');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_evidence_items');
        Schema::dropIfExists('compliance_disclosures');
        Schema::dropIfExists('compliance_authority_requests');
        Schema::dropIfExists('compliance_cases');
        Schema::dropIfExists('compliance_breach_incidents');
        Schema::dropIfExists('compliance_deletion_jobs');
        Schema::dropIfExists('compliance_legal_holds');
        Schema::dropIfExists('compliance_data_subject_requests');
        Schema::dropIfExists('compliance_consent_records');
        Schema::dropIfExists('platform_legal_notices');
    }
};
