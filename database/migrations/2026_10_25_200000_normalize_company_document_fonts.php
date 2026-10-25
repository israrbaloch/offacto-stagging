<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const ALLOWED = ['inter', 'georgia', 'helvetica', 'courier_new'];

    public function up(): void
    {
        DB::table('company_settings')
            ->whereNotIn('document_font', self::ALLOWED)
            ->update(['document_font' => 'inter']);
    }

    public function down(): void
    {
        // No rollback — previous font keys are deprecated.
    }
};
