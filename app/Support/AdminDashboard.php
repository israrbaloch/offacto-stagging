<?php

namespace App\Support;

use App\Models\Company;
use App\Models\SubscriptionPayment;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AdminDashboard
{
    public static function data(): array
    {
        $now = now();
        $start = $now->copy()->startOfMonth()->subMonths(11);
        $soon = $now->copy()->addDays(7);
        $monthStart = $now->copy()->startOfMonth();

        $companies = Company::query()->with('statusRelation:id,name')->get();
        $plans = SubscriptionPlan::query()->get()->keyBy('slug');

        $activeSubscriptions = $companies->filter(fn (Company $company) => $company->hasValidSubscription());
        $trials = $companies->filter(function (Company $company) {
            return ! $company->hasValidSubscription()
                && $company->trial_ends_at
                && $company->trial_ends_at->isFuture();
        });
        $trialsEndingSoon = $trials->filter(fn (Company $company) => $company->trial_ends_at->lte($soon));
        $expiredTrials = $companies->filter(function (Company $company) {
            return ! $company->hasValidSubscription()
                && $company->trial_ends_at
                && $company->trial_ends_at->isPast();
        })->sortByDesc(fn (Company $company) => $company->trial_ends_at);
        $subscriptionsExpiring = $activeSubscriptions->filter(function (Company $company) use ($soon) {
            return $company->subscription_ends_at && $company->subscription_ends_at->lte($soon);
        });
        $canceling = $activeSubscriptions->filter(fn (Company $company) => (bool) $company->subscription_cancel_at_period_end);

        $pendingCompanyCount = Company::query()->pending()->count();
        $pendingCompanies = Company::query()
            ->pending()
            ->with('user:id,name')
            ->latest()
            ->limit(6)
            ->get();

        $customers = User::query()->whereDoesntHave('roles', fn ($query) => $query->where('name', 'admin'));

        $paidPayments = SubscriptionPayment::query()->where('status', 'paid')->get(['amount_cents', 'paid_at', 'created_at']);
        $subscriptionRevenue = round($paidPayments->sum('amount_cents') / 100, 2);
        $revenueThisMonth = round($paidPayments->filter(fn (SubscriptionPayment $payment) => self::paidOn($payment)?->gte($monthStart))->sum('amount_cents') / 100, 2);

        $failedPayments = SubscriptionPayment::query()
            ->with(['company:id,company_name', 'plan'])
            ->whereIn('status', ['failed', 'canceled', 'expired'])
            ->latest()
            ->limit(8)
            ->get();
        $failedPaymentCount = SubscriptionPayment::query()
            ->whereIn('status', ['failed', 'canceled', 'expired'])
            ->count();
        $failedPaymentAmount = round(SubscriptionPayment::query()
            ->whereIn('status', ['failed', 'canceled', 'expired'])
            ->sum('amount_cents') / 100, 2);

        $planRows = self::planCounts($activeSubscriptions, $plans);
        $alerts = self::alerts(
            $pendingCompanyCount,
            $failedPaymentCount,
            $failedPaymentAmount,
            $trialsEndingSoon->count(),
            $subscriptionsExpiring->count(),
            $canceling->count(),
            $expiredTrials->count(),
        );

        return [
            'generatedAt' => $now->toIso8601String(),
            'summary' => [
                'companies' => [
                    'total' => $companies->count(),
                    'active' => $companies->where('is_active', true)->count(),
                    'pending' => $pendingCompanyCount,
                    'thisMonth' => $companies->filter(fn (Company $company) => $company->created_at?->gte($monthStart))->count(),
                ],
                'users' => [
                    'total' => (clone $customers)->count(),
                    'verified' => (clone $customers)->whereNotNull('email_verified_at')->count(),
                    'active' => (clone $customers)->where('is_active', true)->count(),
                    'thisMonth' => (clone $customers)->where('created_at', '>=', $monthStart)->count(),
                ],
                'subscriptions' => [
                    'active' => $activeSubscriptions->count(),
                    'expiringSoon' => $subscriptionsExpiring->count(),
                    'canceling' => $canceling->count(),
                    'revenue' => $subscriptionRevenue,
                    'thisMonth' => $revenueThisMonth,
                    'recurring' => round(collect($planRows)->sum('monthly'), 2),
                ],
                'trials' => [
                    'active' => $trials->count(),
                    'endingSoon' => $trialsEndingSoon->count(),
                    'expired' => $expiredTrials->count(),
                ],
                'failedPayments' => [
                    'count' => $failedPaymentCount,
                    'amount' => $failedPaymentAmount,
                ],
                'pendingApprovals' => $pendingCompanyCount,
                'alerts' => count($alerts),
            ],
            'alerts' => $alerts,
            'months' => self::months($start, $paidPayments),
            'companyStatuses' => self::namedCounts(
                $companies->groupBy(fn (Company $company) => $company->statusRelation?->name ?: 'No status')->map->count()
            ),
            'plans' => $planRows,
            'chargeStatuses' => self::chargeStatuses(),
            'pendingCompanies' => $pendingCompanies->map(fn (Company $company) => [
                'id' => $company->id,
                'name' => $company->company_name,
                'owner' => $company->user?->name,
                'created_at' => $company->created_at?->toIso8601String(),
            ])->values()->all(),
            'failedPayments' => $failedPayments->map(fn (SubscriptionPayment $payment) => [
                'id' => $payment->id,
                'company' => $payment->company?->company_name,
                'plan' => $payment->plan?->label('name') ?? 'Plan',
                'status' => $payment->status,
                'amount' => round($payment->amount_cents / 100, 2),
                'created_at' => $payment->created_at?->toIso8601String(),
            ])->values()->all(),
            'unconverted' => $expiredTrials->take(6)->map(fn (Company $company) => [
                'id' => $company->id,
                'name' => $company->company_name,
                'ended_at' => $company->trial_ends_at?->toIso8601String(),
            ])->values()->all(),
            'recentUsers' => (clone $customers)
                ->latest()
                ->limit(6)
                ->get(['id', 'name', 'email', 'email_verified_at', 'created_at'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'verified' => $user->email_verified_at !== null,
                    'created_at' => $user->created_at?->toIso8601String(),
                ])->values()->all(),
        ];
    }

    /**
     * @param  Collection<int, SubscriptionPayment>  $paidPayments
     * @return list<array{label: string, short: string, companies: int, users: int, subscriptions: int, revenue: float}>
     */
    private static function months(Carbon $start, Collection $paidPayments): array
    {
        $created = [
            'companies' => Company::query()->where('created_at', '>=', $start)->pluck('created_at'),
            'users' => User::query()
                ->whereDoesntHave('roles', fn ($query) => $query->where('name', 'admin'))
                ->where('created_at', '>=', $start)
                ->pluck('created_at'),
        ];

        $rows = [];
        for ($i = 0; $i < 12; $i++) {
            $month = $start->copy()->addMonths($i);
            $key = $month->format('Y-m');
            $paidThisMonth = $paidPayments->filter(fn (SubscriptionPayment $payment) => self::paidOn($payment)?->format('Y-m') === $key);

            $rows[] = [
                'label' => $month->format('M Y'),
                'short' => $month->format('M'),
                'companies' => $created['companies']->filter(fn ($date) => Carbon::parse($date)->format('Y-m') === $key)->count(),
                'users' => $created['users']->filter(fn ($date) => Carbon::parse($date)->format('Y-m') === $key)->count(),
                'subscriptions' => $paidThisMonth->count(),
                'revenue' => round($paidThisMonth->sum('amount_cents') / 100, 2),
            ];
        }

        return $rows;
    }

    /**
     * @return list<array{tone: string, title: string, detail: string}>
     */
    private static function alerts(
        int $pendingCompanies,
        int $failedPayments,
        float $failedAmount,
        int $trialsEnding,
        int $subscriptionsEnding,
        int $canceling,
        int $expiredTrials,
    ): array {
        $alerts = [];

        if ($failedPayments > 0) {
            $alerts[] = [
                'tone' => 'high',
                'title' => 'Subscription charges did not go through',
                'detail' => $failedPayments.' plan payment'.($failedPayments === 1 ? '' : 's').' failed, were canceled, or expired ('.self::euro($failedAmount).').',
            ];
        }
        if ($pendingCompanies > 0) {
            $alerts[] = [
                'tone' => 'high',
                'title' => 'Companies waiting to join',
                'detail' => $pendingCompanies.' compan'.($pendingCompanies === 1 ? 'y is' : 'ies are').' waiting for approval before they can use the product.',
            ];
        }
        if ($trialsEnding > 0) {
            $alerts[] = [
                'tone' => 'medium',
                'title' => 'Trials ending this week',
                'detail' => $trialsEnding.' compan'.($trialsEnding === 1 ? 'y' : 'ies').' still on trial, with no paid plan, end within 7 days.',
            ];
        }
        if ($canceling > 0) {
            $alerts[] = [
                'tone' => 'medium',
                'title' => 'Subscriptions set to cancel',
                'detail' => $canceling.' paying compan'.($canceling === 1 ? 'y has' : 'ies have').' chosen to stop at the end of the current period.',
            ];
        }
        if ($subscriptionsEnding > 0) {
            $alerts[] = [
                'tone' => 'medium',
                'title' => 'Paid plans ending this week',
                'detail' => $subscriptionsEnding.' subscription'.($subscriptionsEnding === 1 ? '' : 's').' reach their end date within 7 days.',
            ];
        }
        if ($expiredTrials > 0) {
            $alerts[] = [
                'tone' => 'low',
                'title' => 'Trials that did not convert',
                'detail' => $expiredTrials.' compan'.($expiredTrials === 1 ? 'y has' : 'ies have').' finished the trial without buying a plan.',
            ];
        }

        return $alerts;
    }

    /**
     * @param  Collection<int, Company>  $activeSubscriptions
     * @param  Collection<string, SubscriptionPlan>  $plans
     * @return list<array{label: string, count: int, monthly: float}>
     */
    private static function planCounts(Collection $activeSubscriptions, Collection $plans): array
    {
        return $activeSubscriptions
            ->groupBy(fn (Company $company) => $plans->get($company->subscription_plan)?->label('name') ?: ($company->subscription_plan ?: 'Unknown'))
            ->map(function (Collection $group, string $label) use ($plans) {
                $plan = $plans->get($group->first()?->subscription_plan);
                $monthly = round((($plan?->price_cents ?? 0) / 100) * $group->count(), 2);

                return [
                    'label' => $label,
                    'count' => $group->count(),
                    'monthly' => $monthly,
                ];
            })
            ->sortByDesc('count')
            ->values()
            ->all();
    }

    /**
     * @return list<array{label: string, count: int}>
     */
    private static function chargeStatuses(): array
    {
        $counts = SubscriptionPayment::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $labels = [
            'paid' => 'Paid',
            'pending' => 'Pending',
            'failed' => 'Failed',
            'canceled' => 'Canceled',
            'expired' => 'Expired',
        ];

        $rows = [];
        foreach ($labels as $status => $label) {
            $rows[] = ['label' => $label, 'count' => (int) ($counts[$status] ?? 0)];
        }

        foreach ($counts as $status => $total) {
            if (! array_key_exists($status, $labels)) {
                $rows[] = ['label' => ucfirst((string) $status), 'count' => (int) $total];
            }
        }

        return $rows;
    }

    /**
     * @param  Collection<string, int>  $counts
     * @return list<array{label: string, count: int}>
     */
    private static function namedCounts(Collection $counts): array
    {
        return $counts
            ->sortDesc()
            ->map(fn ($count, $label) => ['label' => (string) $label, 'count' => (int) $count])
            ->values()
            ->all();
    }

    private static function paidOn(SubscriptionPayment $payment): ?Carbon
    {
        $date = $payment->paid_at ?? $payment->created_at;

        return $date ? Carbon::parse($date) : null;
    }

    private static function euro(float $amount): string
    {
        return '€'.number_format($amount, 2, '.', ',');
    }
}
