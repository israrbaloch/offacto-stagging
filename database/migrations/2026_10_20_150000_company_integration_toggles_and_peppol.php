<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->boolean('mollie_enabled')->default(true)->after('postbode_api_version');
            $table->boolean('postbode_enabled')->default(true)->after('mollie_enabled');
            $table->boolean('peppol_enabled')->default(false)->after('postbode_enabled');
            $table->string('peppol_test_endpoint')->nullable()->after('peppol_enabled');
            $table->string('peppol_live_endpoint')->nullable()->after('peppol_test_endpoint');
            $table->text('peppol_test_token')->nullable()->after('peppol_live_endpoint');
            $table->text('peppol_live_token')->nullable()->after('peppol_test_token');
        });

        Schema::table('company_legal_documents', function (Blueprint $table) {
            $table->string('title')->nullable()->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('company_legal_documents', function (Blueprint $table) {
            $table->dropColumn('title');
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'mollie_enabled',
                'postbode_enabled',
                'peppol_enabled',
                'peppol_test_endpoint',
                'peppol_live_endpoint',
                'peppol_test_token',
                'peppol_live_token',
            ]);
        });
    }
};
