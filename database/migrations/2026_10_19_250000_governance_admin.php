<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gov_config_change_logs', function (Blueprint $table) {
            $table->id();
            $table->string('setting_key', 128)->index();
            $table->string('section_id', 64)->nullable()->index();
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason')->nullable();
            $table->timestamps();
        });

        Schema::create('gov_config_snapshots', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('registry', 128);
            $table->string('section_id', 64);
            $table->json('payload');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('gov_export_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('export_type', 64);
            $table->string('status', 16)->default('pending');
            $table->string('file_path')->nullable();
            $table->unsignedInteger('row_count')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('downloaded_at')->nullable();
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('gov_import_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('import_type', 64);
            $table->string('status', 16)->default('draft');
            $table->json('field_mapping')->nullable();
            $table->json('stats')->nullable();
            $table->json('error_report')->nullable();
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('gov_bulk_operations', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('operation', 64);
            $table->json('parameters')->nullable();
            $table->json('preview')->nullable();
            $table->text('impact_summary')->nullable();
            $table->string('status', 16)->default('draft');
            $table->foreignId('executed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('gov_scheduled_config_changes', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('title');
            $table->string('registry', 128);
            $table->string('section_id', 64);
            $table->json('payload');
            $table->timestamp('effective_at');
            $table->string('status', 16)->default('scheduled');
            $table->text('reason')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('gov_runbooks', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 128)->unique();
            $table->string('title');
            $table->string('category', 32)->default('outage');
            $table->longText('body');
            $table->string('version', 16)->default('1.0');
            $table->boolean('published')->default(true);
            $table->timestamps();
        });

        Schema::create('gov_admin_automation_keys', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('key_prefix', 16);
            $table->string('key_hash', 64);
            $table->json('scopes')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gov_admin_automation_keys');
        Schema::dropIfExists('gov_runbooks');
        Schema::dropIfExists('gov_scheduled_config_changes');
        Schema::dropIfExists('gov_bulk_operations');
        Schema::dropIfExists('gov_import_jobs');
        Schema::dropIfExists('gov_export_jobs');
        Schema::dropIfExists('gov_config_snapshots');
        Schema::dropIfExists('gov_config_change_logs');
    }
};
