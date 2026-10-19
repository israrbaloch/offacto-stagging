<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communication_delivery_logs', function (Blueprint $table) {
            $table->id();
            $table->string('template_key', 64)->nullable();
            $table->string('event_type', 64)->nullable();
            $table->string('recipient_masked', 255);
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 32)->default('queued');
            $table->string('provider', 32)->nullable();
            $table->string('provider_message_id')->nullable();
            $table->string('subject_snapshot', 255)->nullable();
            $table->boolean('is_test')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
            $table->index(['company_id', 'created_at']);
        });

        Schema::create('communication_suppressions', function (Blueprint $table) {
            $table->id();
            $table->string('email_hash', 64);
            $table->string('email_domain', 255)->nullable();
            $table->string('reason', 32);
            $table->string('channel', 32)->default('email');
            $table->timestamp('suppressed_at');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['email_hash', 'channel', 'reason']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_suppressions');
        Schema::dropIfExists('communication_delivery_logs');
    }
};
