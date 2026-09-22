<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('briefing_answers', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('value');
        });
    }

    public function down(): void
    {
        Schema::table('briefing_answers', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
    }
};
