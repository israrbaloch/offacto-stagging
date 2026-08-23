<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('status', function (Blueprint $table) {
            // Drop unique constraint on name first
            $table->dropUnique(['name']);
            
            // Add 'for' column
            $table->string('for')->nullable()->after('name')->comment('Table/model name where this status is used (e.g., services, customers, offers, invoices)');
            
            // Add unique constraint on name and for combination
            $table->unique(['name', 'for']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('status', function (Blueprint $table) {
            $table->dropUnique(['name', 'for']);
            $table->dropColumn('for');
            $table->unique('name');
        });
    }
};
