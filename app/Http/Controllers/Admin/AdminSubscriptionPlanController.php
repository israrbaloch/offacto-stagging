<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionPlanAdminService;
use App\Support\MoneyAmount;
use App\Support\PlanEntitlementCatalog;
use App\Support\PlanEntitlements;
use App\Support\PlatformLocales;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionPlanController extends Controller
{
    public function index(): Response
    {
        $plans = SubscriptionPlan::query()
            ->whereNull('archived_at')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SubscriptionPlan $plan) => $plan->toAdminArray());

        return Inertia::render('Admin/Plans/Index', [
            'plans' => $plans,
            'planEntitlementCatalog' => PlanEntitlementCatalog::toAdminArray(),
            'locales' => PlatformLocales::codes(),
            'currencies' => ['EUR', 'USD', 'GBP'],
            'intervals' => ['monthly', 'annual'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $locales = PlatformLocales::codes();

        $data = $request->validate([
            'slug' => ['required', 'string', 'max:32', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:subscription_plans,slug'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', Rule::in(['EUR', 'USD', 'GBP'])],
            'billing_interval' => ['required', Rule::in(['monthly', 'annual'])],
            'is_active' => ['required', 'boolean'],
            'is_highlighted' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:255'],
            'name_labels' => ['required', 'array'],
            'description_labels' => ['required', 'array'],
            'entitlements' => ['nullable', 'array'],
        ]);

        SubscriptionPlan::create([
            'slug' => $data['slug'],
            'price_cents' => MoneyAmount::toCents($data['price']),
            'currency' => $data['currency'],
            'billing_interval' => $data['billing_interval'],
            'is_active' => $data['is_active'],
            'is_highlighted' => $data['is_highlighted'],
            'sort_order' => $data['sort_order'],
            'name_labels' => collect($data['name_labels'])->only($locales)->all(),
            'description_labels' => collect($data['description_labels'])->only($locales)->all(),
            'feature_items' => [],
            'entitlements' => PlanEntitlements::normalize($data['entitlements'] ?? PlanEntitlementCatalog::defaultEntitlements()),
        ]);

        ActivityLog::record('admin.plans.created', metadata: ['slug' => $data['slug']]);

        return back()->with('status', 'plan-created');
    }

    public function archive(SubscriptionPlan $plan): RedirectResponse
    {
        $plan->update([
            'is_active' => false,
            'archived_at' => now(),
        ]);

        ActivityLog::record('admin.plans.archived', metadata: ['plan_id' => $plan->id]);

        return back()->with('status', 'plan-archived');
    }

    public function destroy(SubscriptionPlan $plan): RedirectResponse
    {
        if (Company::query()->where('subscription_plan', $plan->slug)->exists()) {
            return back()->with('error', 'Plan is assigned to companies. Archive it instead.');
        }

        $plan->delete();
        ActivityLog::record('admin.plans.deleted', metadata: ['slug' => $plan->slug]);

        return back()->with('status', 'plan-deleted');
    }

    public function update(Request $request, SubscriptionPlanAdminService $plans): RedirectResponse
    {
        $data = $plans->validatePlanBatch($request);
        $plans->persistPlanBatch($data);

        ActivityLog::record('admin.plans.updated', metadata: [
            'plan_ids' => collect($data['plans'])->pluck('id')->all(),
        ]);

        return back()->with('status', 'plans-saved');
    }
}
