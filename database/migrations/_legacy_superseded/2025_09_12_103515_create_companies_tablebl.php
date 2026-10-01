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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id', 'user_id_on_companies_foreign_key')->references('id')->on('users')->onDelete('cascade');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->longText('address');
            $table->string('state');
            $table->string('city');
            $table->string('zip');
            $table->string('country');
            $table->string('kvc');
            $table->string('vat');
            $table->string('btw_id');
            $table->string('website')->nullable();
            $table->string('logo')->nullable();
            $table->json('colors');
            $table->string('mollie_key')->nullable();
            $table->string('mollie_profile_id')->nullable();
            $table->string('mollie_test_key')->nullable();
            $table->string('mollie_test_profile_id')->nullable();
            $table->string('invoice_prefix')->default('INV');
            $table->string('direct_debit')->default('false');
            $table->unsignedBigInteger('status');
            $table->foreign('status', 'status_on_companies_foreign_key')->references('id')->on('statuses')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies_tablebl');
    }
};
