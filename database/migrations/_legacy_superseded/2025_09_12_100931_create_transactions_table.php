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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('invoice_id');
            $table->foreign('invoice_id', 'invoice_id_on_transactions_foreign_key')->references('id')->on('invoices')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 100);
            $table->string('transaction_id', 255)->nullable();
            $table->date('transaction_date');
            $table->date('due_date')->nullable();
            $table->unsignedBigInteger('status');
            $table->foreign('status', 'status_on_transactions_foreign_key')->references('id')->on('statuses')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
