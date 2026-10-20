<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('time_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->boolean('billable')->default(true);
            $table->string('status', 20)->default('completed');
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('invoice_item_id')->nullable()->constrained('invoice_items')->nullOnDelete();
            $table->timestamp('invoiced_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status', 'started_at']);
            $table->index(['company_id', 'customer_id', 'status']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('invoice_item_time_entry', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('time_entry_id')->constrained()->cascadeOnDelete();
            $table->unique('time_entry_id');
        });

        Schema::create('customer_credit_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('provider', 32)->default('creditsafe');
            $table->string('identifier_used', 64)->nullable();
            $table->string('rating', 32)->nullable();
            $table->string('status_label', 64)->nullable();
            $table->json('response_payload')->nullable();
            $table->timestamp('checked_at');
            $table->timestamps();

            $table->index(['company_id', 'customer_id', 'checked_at']);
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->default(1)->change();
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->boolean('creditsafe_enabled')->default(false)->after('whatsapp_api_access_token');
            $table->text('creditsafe_test_api_key')->nullable()->after('creditsafe_enabled');
            $table->text('creditsafe_live_api_key')->nullable()->after('creditsafe_test_api_key');
        });
    }

    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn(['creditsafe_enabled', 'creditsafe_test_api_key', 'creditsafe_live_api_key']);
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->integer('quantity')->default(1)->change();
        });

        Schema::dropIfExists('customer_credit_checks');
        Schema::dropIfExists('invoice_item_time_entry');
        Schema::dropIfExists('time_entries');
    }
};
