<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->string('billing_interval', 16)->default('monthly')->after('currency');
            $table->timestamp('archived_at')->nullable()->after('is_active');
        });

        Schema::create('discount_coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 64)->unique();
            $table->string('name');
            $table->string('type', 16)->default('percent');
            $table->unsignedInteger('amount')->default(0);
            $table->unsignedInteger('max_redemptions')->nullable();
            $table->unsignedInteger('redemption_count')->default(0);
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('eligibility')->nullable();
            $table->timestamps();
        });

        Schema::create('subscription_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 64);
            $table->text('reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_adjustments');
        Schema::dropIfExists('discount_coupons');

        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['billing_interval', 'archived_at']);
        });
    }
};
