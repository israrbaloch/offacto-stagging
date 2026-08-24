<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('briefings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title')->nullable();
            $table->longText('intro')->nullable();
            $table->string('status')->default('draft');
            $table->boolean('auto_generate_offer')->default(true);
            $table->unsignedSmallInteger('valid_until_days')->default(14);
            $table->string('share_token', 64)->unique();
            $table->timestamps();
        });

        Schema::create('briefing_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('briefing_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('type');
            $table->string('label');
            $table->text('help_text')->nullable();
            $table->boolean('required')->default(false);
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('price_override', 15, 2)->nullable();
            $table->json('options')->nullable();
            $table->timestamps();
        });

        Schema::create('briefing_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('briefing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('respondent_name')->nullable();
            $table->string('respondent_email')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('offer_id')->nullable()->constrained('offers')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('briefing_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('response_id')->constrained('briefing_responses')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('briefing_questions')->cascadeOnDelete();
            $table->json('value')->nullable();
            $table->timestamps();
        });

        Schema::table('offers', function (Blueprint $table) {
            $table->foreignId('briefing_response_id')->nullable()->after('customer_id')->constrained('briefing_responses')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('briefing_response_id');
        });
        Schema::dropIfExists('briefing_answers');
        Schema::dropIfExists('briefing_responses');
        Schema::dropIfExists('briefing_questions');
        Schema::dropIfExists('briefings');
    }
};
