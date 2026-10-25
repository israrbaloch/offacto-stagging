<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('type', 20)->default('individual')->change();
        });

        DB::table('customers')->where('type', 'organization')->update(['type' => 'company']);

        Schema::create('customer_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('original_name');
            $table->string('file_path');
            $table->boolean('attach_on_invoice')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_documents');

        DB::table('customers')->where('type', 'company')->update(['type' => 'organization']);

        Schema::table('customers', function (Blueprint $table) {
            $table->enum('type', ['organization', 'individual'])->default('individual')->change();
        });
    }
};
