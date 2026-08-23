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
            $table->string('first_name');
            $table->string('surname');
            $table->unsignedBigInteger('language');
            $table->enum('self_employed_activity', ['main_profession', 'secondary_profession'])->nullable();
            $table->string('email')->unique();
            $table->string('phone')->unique();
            $table->string('vat_number')->required();
            $table->string('company_name')->required();
            $table->string('street')->required();
            $table->string('house')->required();
            $table->string('postal_code')->required();
            $table->string('city')->required();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('language')->references('id')->on('languages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
