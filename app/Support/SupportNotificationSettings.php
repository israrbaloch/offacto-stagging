<?php

namespace App\Support;

use App\Models\SiteSetting;

final class SupportNotificationSettings
{
    /**
     * @return list<string>
     */
    public static function staffRecipientEmails(): array
    {
        $raw = SiteSetting::get('sup_notification_recipients', null);
        $emails = [];
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);
            $emails = is_array($decoded) ? $decoded : [];
        } elseif (is_array($raw)) {
            $emails = $raw;
        }

        $emails = array_values(array_unique(array_filter(array_map(
            fn ($e) => is_string($e) ? strtolower(trim($e)) : '',
            $emails
        ), fn ($e) => filter_var($e, FILTER_VALIDATE_EMAIL))));

        if ($emails !== []) {
            return $emails;
        }

        $fallback = SiteSetting::get('admin_email');

        return filled($fallback) && filter_var($fallback, FILTER_VALIDATE_EMAIL)
            ? [strtolower(trim($fallback))]
            : [];
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
}
