<?php

namespace App\Support;

use App\Models\CommunicationDeliveryLog;

final class CommunicationDeliveryLogger
{
    public static function emailSent(
        string $templateKey,
        string $recipientEmail,
        ?int $companyId = null,
        ?string $subject = null,
        string $eventType = 'email_sent',
    ): void {
        CommunicationDeliveryLog::create([
            'template_key' => $templateKey,
            'event_type' => $eventType,
            'recipient_masked' => CommunicationDeliveryLog::maskEmail($recipientEmail),
            'company_id' => $companyId,
            'status' => 'sent',
            'provider' => config('mail.default'),
            'subject_snapshot' => $subject ? str($subject)->limit(255)->value() : null,
            'is_test' => false,
            'sent_at' => now(),
        ]);
    }

    public static function emailFailed(
        string $templateKey,
        string $recipientEmail,
        ?int $companyId,
        string $reason,
        string $eventType = 'email_failed',
    ): void {
        CommunicationDeliveryLog::create([
            'template_key' => $templateKey,
            'event_type' => $eventType,
            'recipient_masked' => CommunicationDeliveryLog::maskEmail($recipientEmail),
            'company_id' => $companyId,
            'status' => 'failed',
            'provider' => config('mail.default'),
            'subject_snapshot' => null,
            'is_test' => false,
            'metadata' => ['reason' => (string) str($reason)->limit(500)],
            'sent_at' => null,
        ]);
    }
}
