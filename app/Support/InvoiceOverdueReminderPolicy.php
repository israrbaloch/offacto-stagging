<?php

namespace App\Support;

use App\Models\SiteSetting;

final class InvoiceOverdueReminderPolicy
{
    public static function jobsEnabled(): bool
    {
        return CommunicationPolicy::scheduledJobsEnabled();
    }

    /**
     * When true, companies use their own reminder schedule (and per-invoice opt-in).
     */
    public static function useCompanySchedule(): bool
    {
        return self::requiresPerInvoiceOptIn();
    }

    /**
     * When true, only invoices with reminder_enabled are included in automated reminders.
     */
    public static function requiresPerInvoiceOptIn(): bool
    {
        $config = SiteSetting::get('comm_scheduled_notifications', []);
        if (! is_array($config)) {
            return true;
        }

        return (bool) ($config['invoice_reminder_use_company_settings'] ?? true);
    }

    /**
     * @return list<int>
     */
    public static function platformMilestoneDays(): array
    {
        return CompanyReminderPolicy::platformDefaultSchedule();
    }

    public static function platformGraceDays(): int
    {
        return max(0, SiteSetting::getInteger('fin_reminder_grace_days', 0));
    }

    public static function platformEscalationSuffix(): string
    {
        return trim((string) SiteSetting::get('fin_reminder_escalation_email', ''));
    }

    /** @deprecated Use CompanyReminderPolicy::milestoneDaysAfterDue($company) */
    public static function milestoneDaysAfterDue(): array
    {
        return self::platformMilestoneDays();
    }

    /** @deprecated Use CompanyReminderPolicy::graceDays($company) */
    public static function graceDays(): int
    {
        return self::platformGraceDays();
    }

    /** @deprecated Use CompanyReminderPolicy::escalationSuffix($company) */
    public static function escalationSuffix(): string
    {
        return self::platformEscalationSuffix();
    }

    public static function pauseOnDispute(): bool
    {
        return SiteSetting::getBoolean('fin_reminder_pause_on_dispute', true);
    }
}
