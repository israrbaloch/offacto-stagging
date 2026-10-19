<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\SubscriptionAdjustment;
use App\Models\SubscriptionPlan;
use App\Models\User;

class SubscriptionAdjustmentService
{
    public function extendPeriod(Company $company, User $admin, int $days, ?string $reason = null): void
    {
        $base = $company->subscription_ends_at && $company->subscription_ends_at->isFuture()
            ? $company->subscription_ends_at
            : now();

        $company->forceFill([
            'subscription_ends_at' => $base->copy()->addDays($days),
            'subscription_cancel_at_period_end' => false,
        ])->save();

        $this->record($company, $admin, 'extend_period', $reason, ['days' => $days]);
    }

    public function complimentaryPeriod(Company $company, User $admin, int $days, ?string $planSlug, ?string $reason = null): void
    {
        $plan = $planSlug ? SubscriptionPlan::findBySlug($planSlug) : null;

        $company->forceFill([
            'subscription_plan' => $plan?->slug ?? $company->subscription_plan ?? 'starter',
            'subscription_started_at' => $company->subscription_started_at ?? now(),
            'subscription_ends_at' => now()->addDays($days),
            'subscription_cancel_at_period_end' => false,
        ])->save();

        $this->record($company, $admin, 'complimentary_period', $reason, [
            'days' => $days,
            'plan' => $plan?->slug,
        ]);
    }

    public function changePlan(Company $company, User $admin, string $planSlug, ?string $reason = null): void
    {
        $plan = SubscriptionPlan::findBySlug($planSlug);
        abort_if(! $plan, 422, 'Plan not found.');

        $company->applySubscriptionPayment($plan);

        $this->record($company, $admin, 'change_plan', $reason, ['plan' => $plan->slug]);
    }

    public function cancelAtPeriodEnd(Company $company, User $admin, ?string $reason = null): void
    {
        $company->cancelSubscriptionAtPeriodEnd();
        $this->record($company, $admin, 'cancel_at_period_end', $reason);
    }

    protected function record(Company $company, User $admin, string $action, ?string $reason, ?array $metadata = null): void
    {
        SubscriptionAdjustment::create([
            'company_id' => $company->id,
            'user_id' => $admin->id,
            'action' => $action,
            'reason' => $reason,
            'metadata' => $metadata,
        ]);

        ActivityLog::record('admin.subscription.'.$action, subject: $company, companyId: $company->id, metadata: array_merge(
            ['reason' => $reason],
            $metadata ?? [],
        ));
    }
}
