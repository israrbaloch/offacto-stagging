<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->json('name_labels')->nullable()->after('slug');
            $table->json('description_labels')->nullable()->after('name_labels');
            $table->json('feature_items')->nullable()->after('feature_keys');
        });
    }

    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['name_labels', 'description_labels', 'feature_items']);
        });
    }
};
