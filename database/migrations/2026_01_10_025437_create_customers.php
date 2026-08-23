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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('first_name');
            $table->string('surname');
            $table->enum('type', ['organization', 'individual'])->default('individual');
            $table->unsignedBigInteger('country_id')->default(12);
            $table->string('vat_number', 255)->nullable();
            $table->string('org_name', 255)->nullable();
            $table->string('office_address', 500)->nullable();
            $table->string('email', 255);
            $table->string('phone', 50)->nullable();
            $table->json('email_usage')->nullable();
            $table->json('additional_recivers')->nullable();
            $table->longText('notes')->nullable();
            $table->unsignedBigInteger('status');

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('status')->references('id')->on('status')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
