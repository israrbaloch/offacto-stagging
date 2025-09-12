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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('offer_id');
            $table->foreign('offer_id', 'offer_id_on_invoices_foreign_key')->references('id')->on('offers')->onDelete('cascade');
            $table->string('invoice_number', 255);
            $table->unsignedBigInteger('contact_id');
            $table->foreign('contact_id', 'contact_id_on_invoices_foreign_key')->references('id')->on('contacts')->onDelete('cascade');
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id', 'user_id_on_invoices_foreign_key')->references('id')->on('users')->onDelete('cascade');
            $table->json('recipient')->nullable();
            $table->string('payment_terms', 255);
            $table->longText('description')->nullable();
            $table->string('reference', 255)->nullable();
            $table->string('copyright_agreement', 255);
            $table->longText('comments')->nullable();
            $table->string('attachment', 255)->nullable();
            $table->unsignedBigInteger('status');
            $table->foreign('status', 'status_on_invoices_foreign_key')->references('id')->on('statuses')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
