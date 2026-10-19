<?php

namespace App\Support;

use App\Models\ProductAbExperiment;
use App\Models\ProductAnnouncement;
use App\Models\ProductFeedbackItem;
use App\Models\ProductHelpArticle;
use App\Models\ProductPublicPage;
use App\Models\ProductReleaseNote;
use App\Models\ProductRoadmapItem;
use App\Models\ProductTestimonial;
use App\Models\ProductFeatureRollout;
use Illuminate\Support\Facades\Schema;

final class AdminProductInsights
{
    /**
     * @return array<string, mixed>
     */
    public static function dashboard(): array
    {
        if (! Schema::hasTable('product_public_pages')) {
            return [
                'published_pages' => 0,
                'active_announcements' => 0,
                'pending_testimonials' => 0,
                'help_articles' => 0,
                'running_experiments' => 0,
                'open_feedback' => 0,
                'public_roadmap' => 0,
            ];
        }

        return [
            'published_pages' => ProductPublicPage::query()->where('status', 'published')->count(),
            'active_announcements' => count(ProductPolicy::activeAnnouncements()),
            'pending_testimonials' => ProductTestimonial::query()->where('status', 'pending')->count(),
            'help_articles' => ProductHelpArticle::query()->where('published', true)->count(),
            'running_experiments' => ProductAbExperiment::query()->where('status', 'running')->count(),
            'open_feedback' => ProductFeedbackItem::query()->whereIn('status', ['new', 'grouped', 'planned'])->count(),
            'public_roadmap' => ProductRoadmapItem::query()->where('public', true)->count(),
            'pilot_rollouts' => ProductFeatureRollout::query()->where('status', 'pilot')->count(),
        ];
    }
}
