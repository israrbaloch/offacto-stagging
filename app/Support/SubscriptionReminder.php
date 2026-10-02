<?php

namespace App\Support;

use App\Models\Company;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\Request;

class SubscriptionReminder
{
    public static function reminderDays(): int
    {
        return max(1, SiteSetting::getInteger('subscription_reminder_days', 7));
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function forSession(?Company $company, ?User $user, Request $request): ?array
    {
        if (! $company || ! $user || $user->hasRole('admin')) {
            return null;
        }

        if (! $request->session()->get('subscription_reminder_pending')) {
            return null;
        }

        if ($request->session()->get('subscription_reminder_dismissed')) {
            return null;
        }

        $payload = self::buildPayload($company);
        if ($payload === null) {
            return null;
        }

        $payload['reminders_enabled'] = (bool) $user->billing_reminders_enabled;

        return $payload;
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function buildPayload(Company $company): ?array
    {
        $daysThreshold = self::reminderDays();

        if ($company->hasValidSubscription()) {
            $daysLeft = $company->subscriptionDaysLeft();
            if ($daysLeft === null || $daysLeft > $daysThreshold) {
                return null;
            }

            return [
                'type' => 'subscription',
                'days_left' => $daysLeft,
                'ends_at' => $company->subscription_ends_at?->toIso8601String(),
                'plan' => $company->subscription_plan,
                'cancel_at_period_end' => (bool) $company->subscription_cancel_at_period_end,
            ];
        }

        if ($company->hasActiveSubscription() && $company->isSubscriptionExpired()) {
            return [
                'type' => 'subscription_expired',
                'days_left' => 0,
                'ends_at' => $company->subscription_ends_at?->toIso8601String(),
                'plan' => $company->subscription_plan,
                'cancel_at_period_end' => false,
            ];
        }

        if (! $company->trial_ends_at || $company->hasActiveSubscription()) {
            return null;
        }

        $daysLeft = $company->trialDaysLeft();
        if ($daysLeft === null || $daysLeft > $daysThreshold) {
            return null;
        }

        return [
            'type' => 'trial',
            'days_left' => $daysLeft,
            'ends_at' => $company->trial_ends_at->toIso8601String(),
            'plan' => null,
            'cancel_at_period_end' => false,
        ];
    }

    public static function markLoginPending(Request $request): void
    {
        $request->session()->put('subscription_reminder_pending', true);
        $request->session()->forget('subscription_reminder_dismissed');
    }

    public static function dismiss(Request $request): void
    {
        $request->session()->put('subscription_reminder_dismissed', true);
        $request->session()->forget('subscription_reminder_pending');
    }
}
