<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('customer_reference', 120)->nullable();
            $table->string('payment_term', 20)->nullable();
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->unsignedBigInteger('service_id')->nullable()->change();
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->foreign('service_id')->references('id')->on('services')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->unsignedBigInteger('service_id')->nullable(false)->change();
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->foreign('service_id')->references('id')->on('services')->cascadeOnDelete();
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['customer_reference', 'payment_term']);
        });
    }
};
