<?php

namespace App\Services;

use App\Models\SubscriptionPlan;
use App\Support\MoneyAmount;
use App\Support\PlanEntitlements;
use App\Support\PlatformLocales;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubscriptionPlanAdminService
{
    /**
     * @return array<string, mixed>
     */
    public function validatePlanBatch(Request $request): array
    {
        $locales = PlatformLocales::codes();

        return $request->validate([
            'plans' => ['required', 'array'],
            'plans.*.id' => ['required', 'integer', 'exists:subscription_plans,id'],
            'plans.*.price' => ['required', 'numeric', 'min:0'],
            'plans.*.currency' => ['required', Rule::in(['EUR', 'USD', 'GBP'])],
            'plans.*.billing_interval' => ['nullable', Rule::in(['monthly', 'annual'])],
            'plans.*.is_active' => ['required', 'boolean'],
            'plans.*.is_highlighted' => ['required', 'boolean'],
            'plans.*.sort_order' => ['required', 'integer', 'min:0', 'max:255'],
            'plans.*.name_labels' => ['required', 'array'],
            'plans.*.description_labels' => ['required', 'array'],
            'plans.*.feature_items' => ['required', 'array'],
            'plans.*.feature_items.*.included' => ['required', 'boolean'],
            'plans.*.feature_items.*.label' => ['required', 'array'],
            'plans.*.entitlements' => ['required', 'array'],
            'plans.*.entitlements.capabilities' => ['required', 'array'],
            'plans.*.entitlements.limits' => ['required', 'array'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function persistPlanBatch(array $data): void
    {
        $locales = PlatformLocales::codes();

        foreach ($data['plans'] as $row) {
            SubscriptionPlan::where('id', $row['id'])->update([
                'price_cents' => MoneyAmount::toCents($row['price']),
                'currency' => $row['currency'],
                'billing_interval' => $row['billing_interval'] ?? 'monthly',
                'is_active' => $row['is_active'],
                'is_highlighted' => $row['is_highlighted'],
                'sort_order' => $row['sort_order'],
                'name_labels' => collect($row['name_labels'])->only($locales)->all(),
                'description_labels' => collect($row['description_labels'])->only($locales)->all(),
                'feature_items' => collect($row['feature_items'])->map(function ($item) use ($locales) {
                    return [
                        'included' => (bool) ($item['included'] ?? false),
                        'label' => collect($item['label'] ?? [])->only($locales)->all(),
                    ];
                })->values()->all(),
                'entitlements' => PlanEntitlements::normalize($row['entitlements'] ?? null),
            ]);
        }
    }
}
