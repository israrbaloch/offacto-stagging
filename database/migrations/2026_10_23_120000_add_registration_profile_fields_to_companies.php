<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('legal_form', 32)->nullable()->after('company_name');
            $table->string('vat_regime', 64)->nullable()->after('legal_form');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->string('phone')->nullable()->change();
            $table->string('street')->nullable()->change();
            $table->string('house')->nullable()->change();
            $table->string('postal_code')->nullable()->change();
            $table->string('city')->nullable()->change();
            $table->string('vat_number')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['legal_form', 'vat_regime']);
        });
    }
};
