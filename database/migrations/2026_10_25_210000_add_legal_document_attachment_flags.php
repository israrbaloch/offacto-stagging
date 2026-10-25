<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_legal_documents', function (Blueprint $table) {
            $table->boolean('attach_to_invoices_default')->default(false)->after('attach_to_quotes_default');
            $table->boolean('attach_new_customers_only')->default(false)->after('attach_to_invoices_default');
        });

        DB::table('company_legal_documents')->where('type', 'contract')->update(['type' => 'dpa']);
    }

    public function down(): void
    {
        DB::table('company_legal_documents')->where('type', 'dpa')->update(['type' => 'contract']);

        Schema::table('company_legal_documents', function (Blueprint $table) {
            $table->dropColumn(['attach_to_invoices_default', 'attach_new_customers_only']);
        });
    }
};
