<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->boolean('whatsapp_enabled')->default(true)->after('peppol_live_token');
            $table->boolean('whatsapp_use_customer_phone')->default(true)->after('whatsapp_enabled');
            $table->string('whatsapp_business_phone', 32)->nullable()->after('whatsapp_use_customer_phone');
            $table->text('whatsapp_invoice_template')->nullable()->after('whatsapp_business_phone');
            $table->text('whatsapp_quotation_template')->nullable()->after('whatsapp_invoice_template');
            $table->boolean('whatsapp_api_enabled')->default(false)->after('whatsapp_quotation_template');
            $table->string('whatsapp_api_phone_number_id', 64)->nullable()->after('whatsapp_api_enabled');
            $table->text('whatsapp_api_access_token')->nullable()->after('whatsapp_api_phone_number_id');
        });
    }

    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'whatsapp_enabled',
                'whatsapp_use_customer_phone',
                'whatsapp_business_phone',
                'whatsapp_invoice_template',
                'whatsapp_quotation_template',
                'whatsapp_api_enabled',
                'whatsapp_api_phone_number_id',
                'whatsapp_api_access_token',
            ]);
        });
    }
};
