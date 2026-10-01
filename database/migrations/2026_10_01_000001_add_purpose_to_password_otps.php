<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('password_otps', function (Blueprint $table) {
            $table->string('purpose', 32)->default('password_reset')->after('email');
        });

        Schema::table('password_otps', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->unique(['email', 'purpose']);
        });

        if (Schema::hasColumn('users', 'email_verified_at')) {
            DB::table('users')
                ->whereNull('email_verified_at')
                ->update(['email_verified_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::table('password_otps', function (Blueprint $table) {
            $table->dropUnique(['email', 'purpose']);
            $table->unique(['email']);
            $table->dropColumn('purpose');
        });
    }
};
