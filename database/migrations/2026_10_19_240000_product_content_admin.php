<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_public_pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 128)->unique();
            $table->string('title');
            $table->string('page_type', 32)->default('landing');
            $table->string('locale', 8)->default('nl');
            $table->longText('body')->nullable();
            $table->string('status', 16)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('product_announcements', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('title');
            $table->text('body');
            $table->string('severity', 16)->default('info');
            $table->string('audience', 32)->default('all');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('published')->default(false);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('product_testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('author_name');
            $table->string('company_name')->nullable();
            $table->text('body');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->boolean('consent_obtained')->default(false);
            $table->string('status', 16)->default('pending');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('product_help_articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 128)->unique();
            $table->string('title');
            $table->string('category', 32)->default('guide');
            $table->string('locale', 8)->default('nl');
            $table->longText('body');
            $table->boolean('published')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_release_notes', function (Blueprint $table) {
            $table->id();
            $table->string('version', 32);
            $table->string('title');
            $table->text('body');
            $table->string('note_type', 32)->default('feature');
            $table->boolean('published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('product_feature_rollouts', function (Blueprint $table) {
            $table->id();
            $table->string('feature_key', 64)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status', 16)->default('draft');
            $table->json('plan_slugs')->nullable();
            $table->json('company_ids')->nullable();
            $table->unsignedTinyInteger('rollout_percent')->default(0);
            $table->timestamps();
        });

        Schema::create('product_ab_experiments', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('name');
            $table->string('surface', 64);
            $table->string('variant_a_label', 128);
            $table->string('variant_b_label', 128);
            $table->string('success_metric', 128);
            $table->string('status', 16)->default('draft');
            $table->unsignedInteger('privacy_min_sample')->default(100);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });

        Schema::create('product_feedback_items', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('source', 32)->default('in_app');
            $table->string('status', 16)->default('new');
            $table->unsignedInteger('votes')->default(0);
            $table->foreignId('duplicate_of_id')->nullable()->constrained('product_feedback_items')->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('product_roadmap_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('quarter_label', 32)->nullable();
            $table->string('status', 16)->default('planned');
            $table->boolean('public')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_roadmap_items');
        Schema::dropIfExists('product_feedback_items');
        Schema::dropIfExists('product_ab_experiments');
        Schema::dropIfExists('product_feature_rollouts');
        Schema::dropIfExists('product_release_notes');
        Schema::dropIfExists('product_help_articles');
        Schema::dropIfExists('product_testimonials');
        Schema::dropIfExists('product_announcements');
        Schema::dropIfExists('product_public_pages');
    }
};
