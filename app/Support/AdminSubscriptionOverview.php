<?php

namespace App\Support;

use App\Models\Company;
use App\Models\SubscriptionPayment;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Collection;

class AdminSubscriptionOverview
{
    /**
     * @return array<string, mixed>
     */
    public static function dashboard(): array
    {
        $data = AdminDashboard::data();

        return [
            'generatedAt' => $data['generatedAt'],
            'summary' => [
                'subscriptions' => $data['summary']['subscriptions'],
                'trials' => $data['summary']['trials'],
                'failedPayments' => $data['summary']['failedPayments'],
            ],
            'plans' => $data['plans'],
            'months' => $data['months'],
            'chargeStatuses' => $data['chargeStatuses'],
            'failedPayments' => $data['failedPayments'],
            'unconverted' => $data['unconverted'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function companySubscription(Company $company): array
    {
        $company->loadMissing('user:id,name,email');

        $plan = filled($company->subscription_plan)
            ? SubscriptionPlan::findBySlug($company->subscription_plan)
            : null;

        $payments = SubscriptionPayment::query()
            ->where('company_id', $company->id)
            ->with('plan:id,slug,name_labels')
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (SubscriptionPayment $p) => [
                'id' => $p->id,
                'status' => $p->status,
                'amount' => round($p->amount_cents / 100, 2),
                'currency' => $p->currency,
                'plan' => $p->plan?->slug,
                'paid_at' => $p->paid_at?->toIso8601String(),
                'created_at' => $p->created_at?->toIso8601String(),
                'mollie_payment_id' => $p->mollie_payment_id,
            ]);

        $adjustments = $company->subscriptionAdjustments()
            ->with('admin:id,name')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'action' => $row->action,
                'reason' => $row->reason,
                'metadata' => $row->metadata,
                'admin' => $row->admin?->name,
                'created_at' => $row->created_at?->toIso8601String(),
            ]);

        return [
            'company' => [
                'id' => $company->id,
                'name' => $company->company_name,
                'owner' => $company->user?->name,
                'email' => $company->email,
            ],
            'subscription' => [
                'plan' => $company->subscription_plan,
                'plan_label' => $plan?->label('name'),
                'started_at' => $company->subscription_started_at?->toIso8601String(),
                'ends_at' => $company->subscription_ends_at?->toIso8601String(),
                'cancel_at_period_end' => (bool) $company->subscription_cancel_at_period_end,
                'valid' => $company->hasValidSubscription(),
                'expired' => $company->isSubscriptionExpired(),
                'days_left' => $company->subscriptionDaysLeft(),
            ],
            'trial' => [
                'starts_at' => $company->trial_starts_at?->toIso8601String(),
                'ends_at' => $company->trial_ends_at?->toIso8601String(),
                'days_left' => $company->trialDaysLeft(),
                'expired' => $company->isTrialExpired(),
            ],
            'entitlements' => PlanEntitlements::forCompany($company),
            'payments' => $payments,
            'adjustments' => $adjustments,
        ];
    }

    public static function subscriptionState(Company $company): string
    {
        if ($company->subscription_cancel_at_period_end && $company->hasValidSubscription()) {
            return 'canceling';
        }
        if ($company->hasValidSubscription()) {
            return 'active';
        }
        if ($company->hasActiveSubscription() && $company->isSubscriptionExpired()) {
            return 'expired';
        }
        if ($company->trial_ends_at && ! $company->isTrialExpired()) {
            return 'trial';
        }
        if ($company->isTrialExpired() && ! $company->hasValidSubscription()) {
            return 'trial_expired';
        }

        return 'none';
    }

    public static function directoryQuery(?string $q, ?string $plan, ?string $state, ?string $paymentStatus): \Illuminate\Database\Eloquent\Builder
    {
        $query = Company::query()->with(['user:id,name,email']);

        if ($search = trim($q ?? '')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subscription_plan', 'like', "%{$search}%");
            });
        }

        if (filled($plan)) {
            $query->where('subscription_plan', $plan);
        }

        match ($state) {
            'trial' => $query->whereNull('subscription_plan')->whereNotNull('trial_ends_at')->where('trial_ends_at', '>', now()),
            'active' => $query->whereNotNull('subscription_plan')->where(function ($q) {
                $q->whereNull('subscription_ends_at')->orWhere('subscription_ends_at', '>', now());
            }),
            'canceling' => $query->where('subscription_cancel_at_period_end', true),
            'expired' => $query->whereNotNull('subscription_ends_at')->where('subscription_ends_at', '<=', now()),
            'trial_expired' => $query->whereNull('subscription_plan')->whereNotNull('trial_ends_at')->where('trial_ends_at', '<=', now()),
            default => null,
        };

        if (filled($paymentStatus)) {
            $query->whereHas('subscriptionPayments', fn ($q) => $q->where('status', $paymentStatus));
        }

        return $query->orderByDesc('updated_at');
    }
}
