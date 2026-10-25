<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->string('quote_template', 32)->default('modern')->after('payment_terms');
            $table->boolean('require_nda_before_open')->default(false)->after('quote_template');
            $table->boolean('mollie_deposit_enabled')->default(false)->after('require_nda_before_open');
            $table->string('on_acceptance_invoice', 16)->default('draft')->after('mollie_deposit_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn([
                'quote_template',
                'require_nda_before_open',
                'mollie_deposit_enabled',
                'on_acceptance_invoice',
            ]);
        });
    }
};
