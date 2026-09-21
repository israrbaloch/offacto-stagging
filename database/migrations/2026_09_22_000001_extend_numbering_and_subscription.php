<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('numbering_series', function (Blueprint $table) {
            $table->dropUnique(['name']);
            $table->boolean('use_suffix')->default(false)->after('next_number');
            $table->string('suffix', 100)->nullable()->after('use_suffix');
            $table->enum('restart_count', ['never', 'annual', 'monthly'])->default('annual')->after('suffix');
            $table->string('last_period', 20)->nullable()->after('restart_count');
            $table->unique(['company_id', 'name']);
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->string('subscription_plan', 32)->nullable()->after('trial_ends_at');
            $table->timestamp('subscription_started_at')->nullable()->after('subscription_plan');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['subscription_plan', 'subscription_started_at']);
        });

        Schema::table('numbering_series', function (Blueprint $table) {
            $table->dropUnique(['company_id', 'name']);
            $table->dropColumn(['use_suffix', 'suffix', 'restart_count', 'last_period']);
            $table->unique('name');
        });
    }
};
