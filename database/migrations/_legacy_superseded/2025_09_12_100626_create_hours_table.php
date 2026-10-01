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
        Schema::create('hours', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id', 'user_id_on_hours_foreign_key')->references('id')->on('users')->onDelete('cascade');
            $table->unsignedBigInteger('contact_id');
            $table->foreign('contact_id', 'contact_id_on_hours_foreign_key')->references('id')->on('contacts')->onDelete('cascade');
            $table->time('from');
            $table->time('to');
            $table->float('hours');
            $table->longText('note')->nullable();
            $table->unsignedBigInteger('status');
            $table->foreign('status', 'status_on_hours_foreign_key')->references('id')->on('statuses')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hours');
    }
};
