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
}
