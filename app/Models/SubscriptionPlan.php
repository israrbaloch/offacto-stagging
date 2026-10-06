<?php

namespace App\Models;

use App\Support\PlanEntitlementCatalog;
use App\Support\PlanEntitlements;
use App\Support\PlatformLocales;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'slug',
        'name_labels',
        'description_labels',
        'price_cents',
        'currency',
        'is_active',
        'is_highlighted',
        'sort_order',
        'feature_keys',
        'feature_items',
        'entitlements',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_highlighted' => 'boolean',
            'feature_keys' => 'array',
            'feature_items' => 'array',
            'name_labels' => 'array',
            'description_labels' => 'array',
            'entitlements' => 'array',
        ];
    }

    /**
     * @return array{capabilities: array<string, bool>, limits: array<string, array{monthly: ?int, total: ?int}>}
     */
    public function resolvedEntitlements(): array
    {
        if (filled($this->entitlements)) {
            return PlanEntitlements::normalize($this->entitlements);
        }

        return PlanEntitlementCatalog::presetForSlug($this->slug);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SubscriptionPayment::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    public static function findBySlug(?string $slug): ?self
    {
        if (! filled($slug)) {
            return null;
        }

        return static::where('slug', $slug)->first();
    }

    /**
     * Whether this plan is a higher tier than the company's current plan (by sort_order).
     * When there is no current plan, any active plan may be chosen.
     */
    public function isUpgradeFrom(?self $current): bool
    {
        if ($current === null) {
            return true;
        }

        if ($this->slug === $current->slug) {
            return false;
        }

        return (int) $this->sort_order > (int) $current->sort_order;
    }

    public function label(string $field, ?string $locale = null): string
    {
        $locale = $locale ?: app()->getLocale();
        $map = $field === 'name' ? ($this->name_labels ?? []) : ($this->description_labels ?? []);
        if (filled($map[$locale] ?? null)) {
            return (string) $map[$locale];
        }
        if (filled($map['en'] ?? null)) {
            return (string) $map['en'];
        }

        $key = 'upgrade.plans.'.$this->slug.'.'.($field === 'name' ? 'name' : 'description');

        return __($key);
    }

    /**
     * @return list<string>
     */
    public function displayFeatures(?string $locale = null): array
    {
        $locale = $locale ?: app()->getLocale();
        $items = $this->feature_items ?? [];
        $lines = [];

        foreach ($items as $item) {
            if (empty($item['included'])) {
                continue;
            }
            $labels = $item['label'] ?? [];
            $text = $labels[$locale] ?? $labels['en'] ?? '';
            if (filled($text)) {
                $lines[] = $text;
            }
        }

        if ($lines !== []) {
            return $lines;
        }

        foreach ($this->feature_keys ?? [] as $key) {
            $lines[] = __($key);
        }

        return $lines;
    }

    public function formattedPrice(?string $currency = null): string
    {
        $currency = strtoupper($currency ?: $this->currency ?: 'EUR');
        $amount = number_format($this->price_cents / 100, 2, ',', '.');

        return match ($currency) {
            'USD' => '$'.$amount,
            'GBP' => '£'.$amount,
            default => '€'.preg_replace('/,00$/', '', $amount),
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function toUpgradeArray(?string $locale = null, ?self $currentPlan = null): array
    {
        $locale = $locale ?: app()->getLocale();
        $isCurrent = $currentPlan !== null && $this->slug === $currentPlan->slug;

        return [
            'id' => $this->slug,
            'name' => $this->label('name', $locale),
            'description' => $this->label('description', $locale),
            'price' => $this->formattedPrice(),
            'currency' => strtoupper($this->currency ?: 'EUR'),
            'period' => 'month',
            'highlight' => $this->is_highlighted,
            'features' => $this->displayFeatures($locale),
            'is_current' => $isCurrent,
            'can_select' => $this->isUpgradeFrom($currentPlan),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name_labels' => array_merge(PlatformLocales::emptyLabels(), $this->name_labels ?? []),
            'description_labels' => array_merge(PlatformLocales::emptyLabels(), $this->description_labels ?? []),
            'price_cents' => $this->price_cents,
            'currency' => strtoupper($this->currency ?: 'EUR'),
            'is_active' => $this->is_active,
            'is_highlighted' => $this->is_highlighted,
            'sort_order' => $this->sort_order,
            'feature_items' => $this->normalizedFeatureItems(),
            'entitlements' => $this->resolvedEntitlements(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function normalizedFeatureItems(): array
    {
        $items = $this->feature_items ?? [];
        if ($items !== []) {
            return array_values(array_map(function ($item) {
                return [
                    'included' => (bool) ($item['included'] ?? true),
                    'label' => array_merge(PlatformLocales::emptyLabels(), $item['label'] ?? []),
                ];
            }, $items));
        }

        $fallback = [];
        foreach ($this->feature_keys ?? [] as $key) {
            $fallback[] = [
                'included' => true,
                'label' => array_merge(PlatformLocales::emptyLabels(), [
                    'en' => __($key),
                ]),
            ];
        }

        return $fallback;
    }
}
