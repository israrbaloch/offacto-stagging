<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->boolean('automated_reminders_enabled')->default(true)->after('logo_in_emails');
            $table->json('reminder_schedule')->nullable()->after('automated_reminders_enabled');
            $table->unsignedSmallInteger('reminder_grace_days')->nullable()->after('reminder_schedule');
            $table->text('reminder_escalation_text')->nullable()->after('reminder_grace_days');
            $table->json('terms_content')->nullable()->after('reminder_escalation_text');
        });
    }

    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'automated_reminders_enabled',
                'reminder_schedule',
                'reminder_grace_days',
                'reminder_escalation_text',
                'terms_content',
            ]);
        });
    }
};
