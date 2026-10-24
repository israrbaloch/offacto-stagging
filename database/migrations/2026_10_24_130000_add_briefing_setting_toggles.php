<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('briefings', function (Blueprint $table) {
            $table->boolean('ai_writes_intro')->default(true)->after('auto_generate_offer');
            $table->boolean('require_nda_before_start')->default(false)->after('ai_writes_intro');
        });
    }

    public function down(): void
    {
        Schema::table('briefings', function (Blueprint $table) {
            $table->dropColumn(['ai_writes_intro', 'require_nda_before_start']);
        });
    }
};
