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
        Schema::create('numbering_series', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('name')->unique();
            $table->enum('type', ['invoices', 'credit_notes', 'both'])->nullable()->default('invoices');
            $table->string('prefix', 100)->nullable()->default('text');
            $table->enum('year_month', ['year', 'year_short', 'year_month', 'year_short_month'])->nullable();
            $table->enum('separator', ['_','-', '/', '.'])->nullable();
            $table->enum('digits', ['2', '3', '4', '5', '6'])->default('4');
            $table->string('next_number', 100)->nullable()->default('text');
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('numbering_series');
    }
};
