<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('briefings', function (Blueprint $table) {
            $table->decimal('base_price', 15, 2)->default(0)->after('title');
            $table->string('form_locale', 8)->default('auto')->after('valid_until_days');
        });
    }

    public function down(): void
    {
        Schema::table('briefings', function (Blueprint $table) {
            $table->dropColumn(['base_price', 'form_locale']);
        });
    }
};
