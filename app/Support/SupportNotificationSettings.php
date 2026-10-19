<?php

namespace App\Support;

use App\Models\SiteSetting;
use App\Models\User;

final class SupportNotificationSettings
{
    /**
     * @return list<string>
     */
    public static function configuredRecipientEmails(): array
    {
        $raw = SiteSetting::get('sup_notification_recipients', null);
        $emails = [];
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);
            $emails = is_array($decoded) ? $decoded : [];
        } elseif (is_array($raw)) {
            $emails = $raw;
        }

        return self::normalizeEmails($emails);
    }

    /**
     * Platform admins always receive email for support events.
     *
     * @return list<string>
     */
    public static function platformAdminEmails(): array
    {
        return self::normalizeEmails(
            User::query()
                ->where('is_active', true)
                ->whereHas('roles', fn ($q) => $q->where('name', 'admin'))
                ->pluck('email')
                ->all()
        );
    }

    /**
     * Extra addresses from the notification list that are not platform admin accounts (email only, no in-app).
     *
     * @return list<string>
     */
    public static function emailOnlyRecipients(): array
    {
        $configured = self::configuredRecipientEmails();
        $adminEmails = array_flip(self::platformAdminEmails());

        $extra = array_values(array_filter($configured, fn ($email) => ! isset($adminEmails[$email])));

        if ($extra !== []) {
            return $extra;
        }

        $fallback = SiteSetting::get('admin_email');
        $normalized = self::normalizeEmails([$fallback]);
        if ($normalized === []) {
            return [];
        }

        $email = $normalized[0];

        return isset($adminEmails[$email]) ? [] : [$email];
    }

    /**
     * All email recipients for a support event (admins + email-only list).
     *
     * @return list<string>
     */
    public static function allEmailRecipients(): array
    {
        return array_values(array_unique([...self::platformAdminEmails(), ...self::emailOnlyRecipients()]));
    }

    public static function notifyAdminInApp(): bool
    {
        return SiteSetting::getBoolean('sup_notify_admin_in_app', true);
    }

    public static function notifyOnNewTicket(): bool
    {
        return SiteSetting::getBoolean('sup_notify_new_ticket', true);
    }

    public static function notifyOnStaffReply(): bool
    {
        return SiteSetting::getBoolean('sup_notify_staff_reply', false);
    }

    public static function notifyOnCustomerReply(): bool
    {
        return SiteSetting::getBoolean('sup_notify_customer_reply', true);
    }

    public static function notifyOnAssignment(): bool
    {
        return SiteSetting::getBoolean('sup_notify_assignment', true);
    }

    /**
     * @param  list<mixed>  $emails
     * @return list<string>
     */
    private static function normalizeEmails(array $emails): array
    {
        return array_values(array_unique(array_filter(array_map(
            fn ($e) => is_string($e) ? strtolower(trim($e)) : '',
            $emails
        ), fn ($e) => filter_var($e, FILTER_VALIDATE_EMAIL))));
    }
}
