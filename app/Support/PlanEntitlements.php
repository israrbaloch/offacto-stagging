<?php

namespace App\Support;

use App\Models\Briefing;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Offer;
use App\Models\Service;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Carbon;

class PlanEntitlements
{
    /**
     * @param  array<string, mixed>|null  $raw
     * @return array{capabilities: array<string, bool>, limits: array<string, array{monthly: ?int, total: ?int}>}
     */
    public static function normalize(?array $raw): array
    {
        $defaults = PlanEntitlementCatalog::defaultEntitlements();
        $capabilities = $defaults['capabilities'];
        $limits = $defaults['limits'];

        if (is_array($raw['capabilities'] ?? null)) {
            foreach (PlanEntitlementCatalog::capabilityKeys() as $key) {
                if (array_key_exists($key, $raw['capabilities'])) {
                    $capabilities[$key] = (bool) $raw['capabilities'][$key];
                }
            }
        }

        if (is_array($raw['limits'] ?? null)) {
            foreach (PlanEntitlementCatalog::limitKeys() as $key) {
                $row = $raw['limits'][$key] ?? null;
                if (! is_array($row)) {
                    continue;
                }
                $limits[$key] = [
                    'monthly' => self::normalizeLimitValue($row['monthly'] ?? null),
                    'total' => self::normalizeLimitValue($row['total'] ?? null),
                ];
            }
        }

        return [
            'capabilities' => $capabilities,
            'limits' => $limits,
        ];
    }

    private static function normalizeLimitValue(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $int = (int) $value;

        return $int < 0 ? null : $int;
    }

    public static function forCompany(?Company $company): array
    {
        if (! $company) {
            return PlanEntitlementCatalog::defaultEntitlements();
        }

        if ($company->hasValidSubscription() && filled($company->subscription_plan)) {
            $plan = SubscriptionPlan::findBySlug($company->subscription_plan);
            if ($plan) {
                return self::normalize($plan->entitlements);
            }
        }

        if (! $company->isTrialExpired()) {
            return PlanEntitlementCatalog::trialEntitlements();
        }

        return PlanEntitlementCatalog::defaultEntitlements();
    }

    public static function allows(?Company $company, string $capabilityKey): bool
    {
        $entitlements = self::forCompany($company);

        return (bool) ($entitlements['capabilities'][$capabilityKey] ?? false);
    }

    public static function capabilityBlockMessage(string $capabilityKey): string
    {
        $label = str_replace('.', ' › ', $capabilityKey);
        foreach (PlanEntitlementCatalog::groups() as $group) {
            foreach ($group['capabilities'] as $cap) {
                if ($cap['key'] === $capabilityKey) {
                    $label = __($cap['label_key']);
                    break 2;
                }
            }
        }

        return __('plan_entitlements.blocked_capability', ['feature' => $label]);
    }

    public static function limitBlockMessage(string $limitKey, string $period): string
    {
        return __('plan_entitlements.blocked_limit', [
            'resource' => __('plan_entitlements.limit_labels.'.$limitKey),
            'period' => __('plan_entitlements.period.'.$period),
        ]);
    }

    /**
     * @return null|string Block reason when over limit or missing capability for create
     */
    public static function blockCreateReason(?User $user, ?Company $company, string $limitKey, string $createCapabilityKey): ?string
    {
        if ($user?->hasRole('admin')) {
            return null;
        }

        if (! self::allows($company, $createCapabilityKey)) {
            return self::capabilityBlockMessage($createCapabilityKey);
        }

        return self::limitExceededReason($company, $limitKey);
    }

    public static function blockCapabilityReason(?User $user, ?Company $company, string $capabilityKey): ?string
    {
        if ($user?->hasRole('admin')) {
            return null;
        }

        if (! self::allows($company, $capabilityKey)) {
            return self::capabilityBlockMessage($capabilityKey);
        }

        return null;
    }

    /**
     * @return null|string
     */
    public static function limitExceededReason(?Company $company, string $limitKey): ?string
    {
        $entitlements = self::forCompany($company);
        $limits = $entitlements['limits'][$limitKey] ?? ['monthly' => null, 'total' => null];

        $monthly = $limits['monthly'] ?? null;
        if ($monthly !== null && self::usageCount($company, $limitKey, 'monthly') >= $monthly) {
            return self::limitBlockMessage($limitKey, 'monthly');
        }

        $total = $limits['total'] ?? null;
        if ($total !== null && self::usageCount($company, $limitKey, 'total') >= $total) {
            return self::limitBlockMessage($limitKey, 'total');
        }

        return null;
    }

    public static function usageCount(?Company $company, string $limitKey, string $period): int
    {
        if (! $company) {
            return 0;
        }

        $since = $period === 'monthly' ? Carbon::now()->startOfMonth() : null;

        return match ($limitKey) {
            'offers' => self::countForCompany(Offer::query(), $company->id, $since),
            'invoices' => self::countForCompany(Invoice::query(), $company->id, $since),
            'customers' => self::countForCompany(Customer::query(), $company->id, $since),
            'services' => self::countForCompany(Service::query(), $company->id, $since),
            'briefings' => self::countForCompany(Briefing::query(), $company->id, $since),
            'companies' => $company->user_id
                ? Company::query()->where('user_id', $company->user_id)->when($since, fn ($q) => $q->where('created_at', '>=', $since))->count()
                : 1,
            'team_users' => $company->users()->count(),
            default => 0,
        };
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<\Illuminate\Database\Eloquent\Model>  $query
     */
    private static function countForCompany($query, int $companyId, ?Carbon $since): int
    {
        $query->where('company_id', $companyId);
        if ($since) {
            $query->where('created_at', '>=', $since);
        }

        return (int) $query->count();
    }

    /**
     * Companies limit is per owner user when creating a new company.
     */
    public static function blockNewCompanyReason(?User $user): ?string
    {
        if ($user?->hasRole('admin')) {
            return null;
        }

        $reference = $user?->activeCompany() ?? Company::query()->where('user_id', $user?->id)->first();
        $entitlements = $reference
            ? self::forCompany($reference)
            : PlanEntitlementCatalog::trialEntitlements();

        if (! ($entitlements['capabilities']['companies.create'] ?? false)) {
            return self::capabilityBlockMessage('companies.create');
        }

        $limits = $entitlements['limits']['companies'] ?? ['monthly' => null, 'total' => null];
        $owned = Company::query()->where('user_id', $user?->id)->count();

        if ($limits['total'] !== null && $owned >= $limits['total']) {
            return self::limitBlockMessage('companies', 'total');
        }

        $monthly = Company::query()
            ->where('user_id', $user?->id)
            ->where('created_at', '>=', Carbon::now()->startOfMonth())
            ->count();
        if ($limits['monthly'] !== null && $monthly >= $limits['monthly']) {
            return self::limitBlockMessage('companies', 'monthly');
        }

        return null;
    }
}
