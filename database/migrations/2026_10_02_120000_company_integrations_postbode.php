<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->string('integrations_mode', 8)->default('test')->after('numbering_series');
            $table->text('mollie_test_key')->nullable()->after('integrations_mode');
            $table->text('mollie_live_key')->nullable()->after('mollie_test_key');
            $table->text('postbode_test_token')->nullable()->after('mollie_live_key');
            $table->text('postbode_live_token')->nullable()->after('postbode_test_token');
            $table->string('postbode_mailbox_code', 32)->nullable()->after('postbode_live_token');
            $table->string('postbode_envelope_uuid', 64)->nullable()->after('postbode_mailbox_code');
            $table->unsignedInteger('postbode_v1_mailbox_id')->nullable()->after('postbode_envelope_uuid');
            $table->unsignedSmallInteger('postbode_v1_envelope_id')->nullable()->after('postbode_v1_mailbox_id');
            $table->char('postbode_default_country', 2)->default('NL')->after('postbode_v1_envelope_id');
            $table->boolean('postbode_registered')->default(false)->after('postbode_default_country');
            $table->boolean('postbode_send_immediately')->default(true)->after('postbode_registered');
            $table->string('postbode_api_version', 4)->default('v2')->after('postbode_send_immediately');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->timestamp('postbode_sent_at')->nullable()->after('peppol_sent_at');
            $table->string('postbode_postal_uuid', 64)->nullable()->after('postbode_sent_at');
            $table->string('postbode_status', 64)->nullable()->after('postbode_postal_uuid');
            $table->string('postbode_customer_reference', 120)->nullable()->after('postbode_status');
        });

        Schema::table('offers', function (Blueprint $table) {
            $table->timestamp('postbode_sent_at')->nullable()->after('voice_note_path');
            $table->string('postbode_postal_uuid', 64)->nullable()->after('postbode_sent_at');
            $table->string('postbode_status', 64)->nullable()->after('postbode_postal_uuid');
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn(['postbode_sent_at', 'postbode_postal_uuid', 'postbode_status']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['postbode_sent_at', 'postbode_postal_uuid', 'postbode_status', 'postbode_customer_reference']);
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'integrations_mode',
                'mollie_test_key',
                'mollie_live_key',
                'postbode_test_token',
                'postbode_live_token',
                'postbode_mailbox_code',
                'postbode_envelope_uuid',
                'postbode_v1_mailbox_id',
                'postbode_v1_envelope_id',
                'postbode_default_country',
                'postbode_registered',
                'postbode_send_immediately',
                'postbode_api_version',
            ]);
        });
    }
};
