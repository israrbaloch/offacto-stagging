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
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('offer_id')->nullable();
            $table->string('invoice_number')->nullable()->unique();
            $table->date('invoice_date')->nullable();
            $table->date('due_date')->nullable();
            $table->longText('intro')->nullable();
            $table->longText('desc')->nullable();
            $table->longText('attachment')->nullable();
            $table->longText('notes')->nullable();
            $table->unsignedBigInteger('status');
            $table->enum('payment_status', ['paid', 'unpaid', 'partial'])->default('unpaid');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('offer_id')->references('id')->on('offers')->onDelete('cascade');
            $table->foreign('status')->references('id')->on('status')->onDelete('cascade');
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
