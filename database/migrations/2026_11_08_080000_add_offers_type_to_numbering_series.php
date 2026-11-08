<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE numbering_series MODIFY type ENUM('invoices', 'credit_notes', 'both', 'offers') NULL DEFAULT 'invoices'");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE numbering_series MODIFY type ENUM('invoices', 'credit_notes', 'both') NULL DEFAULT 'invoices'");
    }
};
