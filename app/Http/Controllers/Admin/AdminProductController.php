<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\ProductAbExperiment;
use App\Models\ProductAnnouncement;
use App\Models\ProductFeatureRollout;
use App\Models\ProductFeedbackItem;
use App\Models\ProductHelpArticle;
use App\Models\ProductPublicPage;
use App\Models\ProductReleaseNote;
use App\Models\ProductRoadmapItem;
use App\Models\ProductTestimonial;
use App\Models\SubscriptionPlan;
use App\Services\PlatformSettingsService;
use App\Support\AdminProductInsights;
use App\Support\PlatformLocales;
use App\Models\SiteSetting;
use App\Support\ProductReference;
use App\Support\ProductSettingsRegistry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminProductController extends Controller
{
    private const REGISTRY = ProductSettingsRegistry::class;

    public function index(): InertiaResponse
    {
        $sections = ProductSettingsRegistry::sections();
        $grouped = collect($sections)->groupBy('group')->map(fn ($items, $group) => [
            'group' => $group,
            'items' => $items->values(),
        ])->values();

        return Inertia::render('Admin/Product/Index', [
            'metrics' => AdminProductInsights::dashboard(),
            'groups' => $grouped,
        ]);
    }

    public function show(string $section, PlatformSettingsService $settings): InertiaResponse|RedirectResponse
    {
        if (ProductSettingsRegistry::isOperationSection($section)) {
            return redirect()->route('admin.product.operation', $section);
        }

        $def = ProductSettingsRegistry::definition($section);
        if (! $def) {
            abort(404);
        }

        return Inertia::render('Admin/Product/Show', [
            'section' => [
                'id' => $section,
                'title' => $def['title'],
                'description' => $def['description'],
                'group' => $def['group'],
            ],
            'fields' => $def['fields'],
            'values' => $settings->valuesForSection($section, self::REGISTRY),
            'nav' => ProductSettingsRegistry::sections(),
            'locales' => PlatformLocales::codes(),
        ]);
    }

    public function update(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        if (ProductSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $data = $settings->validateSection($section, $request, self::REGISTRY);
        $settings->persistSection($section, $data, self::REGISTRY, 'admin.product.updated');

        return back()->with('status', 'product-settings-saved');
    }

    public function reset(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);
        $settings->resetSection($section, self::REGISTRY, 'admin.product.reset');

        return back()->with('status', 'product-settings-reset');
    }

    public function operation(string $section): InertiaResponse
    {
        if (! ProductSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $meta = collect(ProductSettingsRegistry::operationSections())->firstWhere('id', $section);

        $payload = match ($section) {
            'public-cms' => [
                'pages' => ProductPublicPage::query()->orderByDesc('updated_at')->limit(50)->get(),
            ],
            'announcements' => [
                'announcements' => ProductAnnouncement::query()->orderByDesc('created_at')->limit(50)->get(),
            ],
            'testimonials' => [
                'testimonials' => ProductTestimonial::query()->orderByDesc('created_at')->limit(50)->get(),
            ],
            'help-center' => [
                'articles' => ProductHelpArticle::query()->orderBy('sort_order')->orderBy('title')->limit(100)->get(),
            ],
            'release-notes' => [
                'notes' => ProductReleaseNote::query()->orderByDesc('published_at')->orderByDesc('created_at')->limit(50)->get(),
            ],
            'feature-rollouts' => [
                'rollouts' => ProductFeatureRollout::query()->orderBy('feature_key')->get(),
                'plans' => SubscriptionPlan::query()->orderBy('slug')->get(['id', 'slug', 'name_labels']),
                'companies' => Company::query()->orderBy('company_name')->limit(100)->get(['id', 'company_name']),
            ],
            'ab-testing' => [
                'experiments' => ProductAbExperiment::query()->orderByDesc('created_at')->limit(50)->get(),
                'policy' => [
                    'min_participants' => SiteSetting::getInteger('prod_ab_min_participants', 100),
                ],
            ],
            'feedback-roadmap' => [
                'feedback' => ProductFeedbackItem::query()->with('company:id,company_name')->orderByDesc('votes')->orderByDesc('created_at')->limit(50)->get(),
                'roadmap' => ProductRoadmapItem::query()->orderBy('sort_order')->orderBy('title')->limit(50)->get(),
            ],
            default => [],
        };

        return Inertia::render('Admin/Product/Operation', [
            'section' => $meta,
            'operation' => $section,
            'nav' => ProductSettingsRegistry::sections(),
            ...$payload,
        ]);
    }

    public function storePublicPage(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:128', 'alpha_dash', Rule::unique('product_public_pages', 'slug')],
            'title' => ['required', 'string', 'max:255'],
            'page_type' => ['required', Rule::in(['landing', 'product', 'faq', 'help', 'other'])],
            'locale' => ['required', 'string', 'max:8'],
            'body' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'published'])],
        ]);

        ProductPublicPage::create([
            ...$data,
            'published_at' => $data['status'] === 'published' ? now() : null,
        ]);

        ActivityLog::record('admin.product.page.created', metadata: ['slug' => $data['slug']]);

        return back()->with('status', 'product-page-created');
    }

    public function updatePublicPage(Request $request, ProductPublicPage $page): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::in(['draft', 'published'])],
        ]);

        if (isset($data['status']) && $data['status'] === 'published' && ! $page->published_at) {
            $data['published_at'] = now();
        }

        $page->update($data);

        return back()->with('status', 'product-page-updated');
    }

    public function storeAnnouncement(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'severity' => ['required', Rule::in(['info', 'warning', 'critical', 'feature'])],
            'audience' => ['required', Rule::in(['all', 'workspace', 'admin'])],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'published' => ['boolean'],
        ]);

        ProductAnnouncement::create([
            'reference' => ProductReference::make('ANN'),
            ...$data,
            'published' => $request->boolean('published'),
            'created_by_user_id' => $request->user()->id,
        ]);

        ActivityLog::record('admin.product.announcement.created');

        return back()->with('status', 'product-announcement-created');
    }

    public function toggleAnnouncement(Request $request, ProductAnnouncement $announcement): RedirectResponse
    {
        $request->validate(['published' => ['required', 'boolean']]);
        $announcement->update(['published' => $request->boolean('published')]);

        return back()->with('status', 'product-announcement-updated');
    }

    public function storeTestimonial(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'author_name' => ['required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'consent_obtained' => ['accepted'],
        ]);

        ProductTestimonial::create([
            'reference' => ProductReference::make('TST'),
            ...$data,
            'consent_obtained' => true,
            'status' => 'pending',
        ]);

        return back()->with('status', 'product-testimonial-created');
    }

    public function updateTestimonial(Request $request, ProductTestimonial $testimonial): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'published', 'rejected'])],
            'body' => ['sometimes', 'string'],
        ]);

        if ($data['status'] === 'published' && ! $testimonial->consent_obtained) {
            return back()->withErrors(['consent' => 'Consent must be recorded before publishing.']);
        }

        $updates = $data;
        if ($data['status'] === 'published') {
            $updates['published_at'] = now();
        }

        $testimonial->update($updates);

        return back()->with('status', 'product-testimonial-updated');
    }

    public function storeHelpArticle(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:128', 'alpha_dash', Rule::unique('product_help_articles', 'slug')],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::in(['guide', 'integration', 'troubleshooting'])],
            'locale' => ['required', 'string', 'max:8'],
            'body' => ['required', 'string'],
            'published' => ['boolean'],
        ]);

        ProductHelpArticle::create([
            ...$data,
            'published' => $request->boolean('published'),
        ]);

        return back()->with('status', 'product-help-created');
    }

    public function storeReleaseNote(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'version' => ['required', 'string', 'max:32'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'note_type' => ['required', Rule::in(['feature', 'fix', 'known_issue'])],
            'published' => ['boolean'],
        ]);

        ProductReleaseNote::create([
            ...$data,
            'published' => $request->boolean('published'),
            'published_at' => $request->boolean('published') ? now() : null,
        ]);

        return back()->with('status', 'product-release-created');
    }

    public function storeFeatureRollout(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'feature_key' => ['required', 'string', 'max:64', 'alpha_dash', Rule::unique('product_feature_rollouts', 'feature_key')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'pilot', 'ga'])],
            'plan_slugs' => ['nullable', 'array'],
            'company_ids' => ['nullable', 'array'],
            'rollout_percent' => ['integer', 'min:0', 'max:100'],
        ]);

        ProductFeatureRollout::create([
            ...$data,
            'plan_slugs' => $data['plan_slugs'] ?? [],
            'company_ids' => array_map('intval', $data['company_ids'] ?? []),
            'rollout_percent' => $data['rollout_percent'] ?? 0,
        ]);

        return back()->with('status', 'product-rollout-created');
    }

    public function updateFeatureRollout(Request $request, ProductFeatureRollout $rollout): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['draft', 'pilot', 'ga'])],
            'rollout_percent' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'plan_slugs' => ['nullable', 'array'],
            'company_ids' => ['nullable', 'array'],
        ]);

        $rollout->update($data);

        return back()->with('status', 'product-rollout-updated');
    }

    public function storeAbExperiment(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'surface' => ['required', 'string', 'max:64'],
            'variant_a_label' => ['required', 'string', 'max:128'],
            'variant_b_label' => ['required', 'string', 'max:128'],
            'success_metric' => ['required', 'string', 'max:128'],
            'privacy_ack' => ['accepted'],
        ]);

        $min = max(10, (int) \App\Models\SiteSetting::getInteger('prod_ab_min_participants', 100));

        ProductAbExperiment::create([
            'reference' => ProductReference::make('AB'),
            'name' => $data['name'],
            'surface' => $data['surface'],
            'variant_a_label' => $data['variant_a_label'],
            'variant_b_label' => $data['variant_b_label'],
            'success_metric' => $data['success_metric'],
            'privacy_min_sample' => $min,
            'status' => 'draft',
        ]);

        ActivityLog::record('admin.product.ab.created');

        return back()->with('status', 'product-ab-created');
    }

    public function updateAbExperiment(Request $request, ProductAbExperiment $experiment): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['draft', 'running', 'paused', 'completed'])],
        ]);

        $updates = ['status' => $data['status']];
        if ($data['status'] === 'running' && ! $experiment->started_at) {
            $updates['started_at'] = now();
        }
        if ($data['status'] === 'completed') {
            $updates['ended_at'] = now();
        }

        $experiment->update($updates);

        return back()->with('status', 'product-ab-updated');
    }

    public function storeFeedback(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'source' => ['required', Rule::in(['in_app', 'support', 'admin'])],
            'company_id' => ['nullable', 'exists:companies,id'],
        ]);

        ProductFeedbackItem::create([
            'reference' => ProductReference::make('FB'),
            ...$data,
            'status' => 'new',
        ]);

        return back()->with('status', 'product-feedback-created');
    }

    public function updateFeedback(Request $request, ProductFeedbackItem $feedback): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['new', 'grouped', 'planned', 'shipped', 'declined'])],
            'duplicate_of_id' => ['nullable', 'exists:product_feedback_items,id'],
            'votes' => ['sometimes', 'integer', 'min:0'],
        ]);

        $feedback->update($data);

        return back()->with('status', 'product-feedback-updated');
    }

    public function storeRoadmapItem(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quarter_label' => ['nullable', 'string', 'max:32'],
            'status' => ['required', Rule::in(['planned', 'in_progress', 'shipped'])],
            'public' => ['boolean'],
        ]);

        ProductRoadmapItem::create([
            ...$data,
            'public' => $request->boolean('public'),
        ]);

        return back()->with('status', 'product-roadmap-created');
    }

    public function updateRoadmapItem(Request $request, ProductRoadmapItem $roadmap): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['planned', 'in_progress', 'shipped'])],
            'public' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $roadmap->update($data);

        return back()->with('status', 'product-roadmap-updated');
    }
}
