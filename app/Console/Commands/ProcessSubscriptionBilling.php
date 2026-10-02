<?php

namespace App\Console\Commands;

use App\Mail\SubscriptionExpiringMail;
use App\Models\Company;
use App\Models\User;
use App\Support\SubscriptionReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class ProcessSubscriptionBilling extends Command
{
    protected $signature = 'subscriptions:process';

    protected $description = 'Send subscription/trial expiry reminders and end cancelled subscriptions';

    public function handle(): int
    {
        $this->expireSubscriptions();
        $this->sendReminders();

        return self::SUCCESS;
    }

    protected function expireSubscriptions(): void
    {
        Company::query()
            ->whereNotNull('subscription_plan')
            ->whereNotNull('subscription_ends_at')
            ->where('subscription_ends_at', '<', now())
            ->each(function (Company $company) {
                $company->expireSubscription();
            });
    }

    protected function sendReminders(): void
    {
        $days = SubscriptionReminder::reminderDays();

        Company::query()
            ->whereNotNull('trial_ends_at')
            ->whereNull('subscription_plan')
            ->chunkById(50, fn ($companies) => $companies->each(fn (Company $c) => $this->sendTrialReminder($c, $days)));

        Company::query()
            ->whereNotNull('subscription_plan')
            ->whereNotNull('subscription_ends_at')
            ->chunkById(50, fn ($companies) => $companies->each(fn (Company $c) => $this->sendSubscriptionReminder($c, $days)));
    }

    protected function sendTrialReminder(Company $company, int $days): void
    {
        if ($company->hasActiveSubscription() || ! $company->trial_ends_at) {
            return;
        }

        $daysLeft = $company->trialDaysLeft();
        if ($daysLeft === null || $daysLeft > $days || $daysLeft < 0) {
            return;
        }

        if ($company->trial_expiry_reminder_sent_at?->isToday()) {
            return;
        }

        $this->sendMail($company, 'trial', $daysLeft, null);
        $company->update(['trial_expiry_reminder_sent_at' => now()]);
    }

    protected function sendSubscriptionReminder(Company $company, int $days): void
    {
        if (! $company->hasValidSubscription()) {
            return;
        }

        $daysLeft = $company->subscriptionDaysLeft();
        if ($daysLeft === null || $daysLeft > $days) {
            return;
        }

        if ($company->subscription_expiry_reminder_sent_at?->isToday()) {
            return;
        }

        $this->sendMail($company, 'subscription', $daysLeft, $company->subscription_plan);
        $company->update(['subscription_expiry_reminder_sent_at' => now()]);
    }

    protected function sendMail(Company $company, string $kind, int $daysLeft, ?string $planSlug): void
    {
        $recipients = $this->reminderRecipients($company);
        if ($recipients === []) {
            return;
        }

        $mailable = new SubscriptionExpiringMail($company, $kind, $daysLeft, $planSlug);

        foreach ($recipients as $email) {
            Mail::to($email)->send($mailable);
        }
    }

    /**
     * @return list<string>
     */
    protected function reminderRecipients(Company $company): array
    {
        $owner = User::query()->find($company->user_id);
        if (! $owner?->billing_reminders_enabled) {
            return [];
        }

        $emails = array_filter([
            $owner->email,
            $company->email,
        ]);

        return array_values(array_unique($emails));
    }
}
