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
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('contact_id');
            $table->foreign('contact_id', 'contact_id_on_offers_foreign_key')->references('id')->on('contacts')->onDelete('cascade');
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id', 'user_id_on_offers_foreign_key')->references('id')->on('users')->onDelete('cascade');
            $table->json('questions')->nullable();
            $table->date('expires_at');
            $table->longText('intro');
            $table->longText('assignment');
            $table->unsignedBigInteger('status');
            $table->foreign('status', 'status_on_offers_foreign_key')->references('id')->on('statuses')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
