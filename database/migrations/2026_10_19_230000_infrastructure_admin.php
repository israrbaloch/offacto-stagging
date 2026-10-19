<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('infra_backup_runs', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('destination', 128);
            $table->string('status', 32)->default('completed');
            $table->boolean('encrypted')->default(true);
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('infra_restore_tests', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('status', 32)->default('planned');
            $table->timestamp('tested_at')->nullable();
            $table->text('result_notes')->nullable();
            $table->foreignId('authorized_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('infra_maintenance_windows', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->boolean('pause_queues')->default(false);
            $table->boolean('maintenance_mode')->default(false);
            $table->string('status', 32)->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('infra_maintenance_windows');
        Schema::dropIfExists('infra_restore_tests');
        Schema::dropIfExists('infra_backup_runs');
    }
};
