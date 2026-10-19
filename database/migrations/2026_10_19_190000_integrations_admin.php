<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url', 2048);
            $table->json('events')->nullable();
            $table->text('signing_secret')->nullable();
            $table->boolean('active')->default(true);
            $table->unsignedSmallInteger('max_retries')->default(5);
            $table->timestamps();
        });

        Schema::create('integration_api_keys', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('key_prefix', 16);
            $table->string('key_hash', 64);
            $table->json('scopes')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['key_prefix', 'revoked_at']);
        });

        Schema::create('integration_failures', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 64);
            $table->string('operation', 64);
            $table->string('reference')->nullable();
            $table->string('status', 32)->default('open');
            $table->text('message')->nullable();
            $table->json('metadata')->nullable();
            $table->unsignedSmallInteger('retry_count')->default(0);
            $table->timestamp('next_retry_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->index(['provider', 'status']);
        });

        Schema::create('integration_providers', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('name');
            $table->text('purpose')->nullable();
            $table->text('data_access')->nullable();
            $table->string('operational_status', 32)->default('active');
            $table->string('compliance_doc_url', 2048)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_providers');
        Schema::dropIfExists('integration_failures');
        Schema::dropIfExists('integration_api_keys');
        Schema::dropIfExists('integration_webhooks');
    }
};
