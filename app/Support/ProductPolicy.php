<?php

namespace App\Support;

use App\Models\ProductAnnouncement;
use App\Models\ProductFeatureRollout;
use App\Models\SiteSetting;
use Illuminate\Support\Carbon;

final class ProductPolicy
{
    public static function defaultsNewWorkspaceOnly(): bool
    {
        return SiteSetting::getBoolean('prod_defaults_new_only_ack', true);
    }

    public static function defaultLocale(): string
    {
        return SiteSetting::getString('prod_default_locale', 'nl') ?: 'nl';
    }

    public static function defaultCurrency(): string
    {
        return SiteSetting::getString('prod_default_currency', 'EUR') ?: 'EUR';
    }

    public static function defaultPaymentTermsDays(): int
    {
        return max(0, SiteSetting::getInteger('prod_default_payment_terms_days', 14));
    }

    /**
     * @return array<string, mixed>
     */
    public static function workspaceDefaultBag(): array
    {
        $raw = SiteSetting::get('prod_default_workspace_defaults', '{}');
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;

        return is_array($decoded) ? $decoded : [];
    }

    public static function featureEnabledForCompany(string $featureKey, ?int $companyId, ?string $planSlug = null): bool
    {
        $rollout = ProductFeatureRollout::query()->where('feature_key', $featureKey)->first();
        if (! $rollout || $rollout->status === 'draft') {
            return false;
        }

        if ($rollout->status === 'ga') {
            return true;
        }

        $plans = $rollout->plan_slugs ?? [];
        if ($planSlug && is_array($plans) && in_array($planSlug, $plans, true)) {
            return true;
        }

        $companies = $rollout->company_ids ?? [];
        if ($companyId && is_array($companies) && in_array($companyId, $companies, true)) {
            return true;
        }

        if ($companyId && $rollout->rollout_percent > 0) {
            return ($companyId % 100) < $rollout->rollout_percent;
        }

        return false;
    }

    /**
     * @return list<ProductAnnouncement>
     */
    public static function activeAnnouncements(string $audience = 'all'): array
    {
        $now = Carbon::now();

        return ProductAnnouncement::query()
            ->where('published', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->when($audience !== 'all', fn ($q) => $q->whereIn('audience', ['all', $audience]))
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->all();
    }
}
