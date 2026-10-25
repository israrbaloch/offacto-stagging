<?php

namespace App\Support;

use App\Models\Company;
use App\Models\SiteSetting;

final class CompanyReminderPolicy
{
    public static function automatedEnabled(?Company $company): bool
    {
        $settings = $company?->companySetting;
        if ($settings && $settings->automated_reminders_enabled === false) {
            return false;
        }

        return InvoiceOverdueReminderPolicy::jobsEnabled();
    }

    /**
     * @return list<int>
     */
    public static function milestoneDaysAfterDue(?Company $company): array
    {
        if ($company && InvoiceOverdueReminderPolicy::useCompanySchedule()) {
            $stageDays = array_column(self::stageDefinitions($company), 'days');
            if ($stageDays !== []) {
                return self::normalizeDays($stageDays);
            }

            $custom = $company->companySetting?->reminder_schedule;
            if (is_string($custom)) {
                $custom = json_decode($custom, true);
            }
            if (is_array($custom) && $custom !== []) {
                return self::normalizeDays($custom);
            }
        }

        return InvoiceOverdueReminderPolicy::platformMilestoneDays();
    }

    /**
     * @return list<array{days: int, body: string}>
     */
    public static function stageDefinitions(?Company $company): array
    {
        if (! $company) {
            return InvoiceReminderTemplate::defaultStages();
        }

        $raw = $company->companySetting?->reminder_stages;
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }
        if (is_array($raw) && $raw !== []) {
            return InvoiceReminderTemplate::normalizeStages($raw);
        }

        $schedule = $company->companySetting?->reminder_schedule;
        if (is_string($schedule)) {
            $schedule = json_decode($schedule, true);
        }
        if (is_array($schedule) && $schedule !== []) {
            $defaults = InvoiceReminderTemplate::defaultStages();
            $days = self::normalizeDays($schedule);
            $stages = [];
            foreach ($days as $i => $day) {
                $stages[] = [
                    'days' => $day,
                    'body' => $defaults[$i]['body'] ?? '',
                ];
            }

            return InvoiceReminderTemplate::normalizeStages($stages);
        }

        return InvoiceReminderTemplate::defaultStages();
    }

    public static function stageBody(?Company $company, int $stageIndex): ?string
    {
        $stages = self::stageDefinitions($company);
        $body = trim((string) ($stages[$stageIndex]['body'] ?? ''));

        return $body !== '' ? $body : null;
    }

    public static function graceDays(?Company $company): int
    {
        if ($company && InvoiceOverdueReminderPolicy::useCompanySchedule()) {
            $days = $company->companySetting?->reminder_grace_days;
            if ($days !== null) {
                return max(0, (int) $days);
            }
        }

        return InvoiceOverdueReminderPolicy::platformGraceDays();
    }

    public static function escalationSuffix(?Company $company): string
    {
        if ($company && InvoiceOverdueReminderPolicy::useCompanySchedule()) {
            $text = trim((string) ($company->companySetting?->reminder_escalation_text ?? ''));
            if ($text !== '') {
                return $text;
            }
        }

        return InvoiceOverdueReminderPolicy::platformEscalationSuffix();
    }

    /**
     * @return array{schedule: list<int>, grace_days: int, escalation: string, automated_enabled: bool}
     */
    public static function formDefaults(?Company $company): array
    {
        $stages = self::stageDefinitions($company);

        return [
            'automated_reminders_enabled' => $company?->companySetting?->automated_reminders_enabled ?? true,
            'schedule' => array_column($stages, 'days'),
            'stages' => $stages,
            'grace_days' => self::graceDays($company),
            'escalation' => self::escalationSuffix($company),
            'uses_platform_fallback' => ! self::hasCustomSchedule($company),
        ];
    }

    public static function hasCustomSchedule(?Company $company): bool
    {
        $custom = $company?->companySetting?->reminder_schedule;
        if (is_string($custom)) {
            $custom = json_decode($custom, true);
        }

        return is_array($custom) && $custom !== [];
    }

    /**
     * @param  array<mixed>  $days
     * @return list<int>
     */
    public static function normalizeDays(array $days): array
    {
        $normalized = array_values(array_unique(array_filter(array_map('intval', $days), fn (int $d) => $d > 0)));
        sort($normalized);

        return $normalized !== [] ? $normalized : [7, 14, 30];
    }

    /**
     * @return list<int>
     */
    public static function platformDefaultSchedule(): array
    {
        $schedule = SiteSetting::get('fin_reminder_schedule', null);
        if ($schedule === null) {
            $schedule = FinancialDocumentSettingsRegistry::definition('overdue-reminders')['fields'][0]['default'] ?? [7, 14, 30];
        }
        if (is_string($schedule)) {
            $schedule = json_decode($schedule, true);
        }

        return is_array($schedule) ? self::normalizeDays($schedule) : [7, 14, 30];
    }
}
