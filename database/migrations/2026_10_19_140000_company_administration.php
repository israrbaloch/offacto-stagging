<?php

use App\Models\Status;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Status::firstOrCreate(
            ['name' => 'Restricted', 'for' => 'companies'],
            ['name' => 'Restricted', 'for' => 'companies'],
        );

        Schema::table('companies', function (Blueprint $table) {
            $table->string('legal_name')->nullable()->after('company_name');
        });

        Schema::create('company_status_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 64);
            $table->text('reason')->nullable();
            $table->unsignedBigInteger('previous_status_id')->nullable();
            $table->unsignedBigInteger('new_status_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'created_at']);
        });

        Schema::create('company_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('status', 32)->default('not_required');
            $table->text('notes')->nullable();
            $table->json('requirements')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('company_feature_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('capability_key', 120);
            $table->boolean('granted');
            $table->text('reason')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['company_id', 'capability_key']);
        });

        Schema::create('company_data_exports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('format', 16)->default('json');
            $table->string('status', 32)->default('pending');
            $table->string('file_path')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('company_deletion_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 32)->default('pending');
            $table->text('reason')->nullable();
            $table->date('retention_until')->nullable();
            $table->boolean('legal_hold')->default(false);
            $table->timestamp('anonymized_at')->nullable();
            $table->timestamp('permanently_deleted_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_deletion_requests');
        Schema::dropIfExists('company_data_exports');
        Schema::dropIfExists('company_feature_overrides');
        Schema::dropIfExists('company_verifications');
        Schema::dropIfExists('company_status_events');

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('legal_name');
        });
    }
};
