<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->boolean('reminder_enabled')->default(false)->after('email_message');
            $table->integer('reminder_days_before_due')->nullable()->after('reminder_enabled');
            $table->date('reminder_send_on')->nullable()->after('reminder_days_before_due');
            $table->timestamp('reminder_sent_at')->nullable()->after('reminder_send_on');
            $table->boolean('needs_resend')->default(false)->after('reminder_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'reminder_enabled',
                'reminder_days_before_due',
                'reminder_send_on',
                'reminder_sent_at',
                'needs_resend',
            ]);
        });
    }
};
