<?php

namespace App\Services;

use App\Mail\SupportTicketStaffNotification;
use App\Models\SupportTicket;
use App\Support\PlatformMailConfigurator;
use App\Support\SupportNotificationSettings;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SupportTicketNotifier
{
    public function notify(string $event, SupportTicket $ticket, array $context = []): void
    {
        if (! $this->shouldNotify($event)) {
            return;
        }

        $recipients = SupportNotificationSettings::staffRecipientEmails();
        if ($recipients === []) {
            return;
        }

        try {
            PlatformMailConfigurator::apply();
            Mail::to($recipients)->send(new SupportTicketStaffNotification($event, $ticket, $context));
        } catch (\Throwable $e) {
            Log::warning('support.ticket.notification_failed', [
                'event' => $event,
                'ticket' => $ticket->reference,
                'message' => $e->getMessage(),
            ]);
        }
    }

    protected function shouldNotify(string $event): bool
    {
        return match ($event) {
            'new_ticket' => SupportNotificationSettings::notifyOnNewTicket(),
            'customer_reply' => SupportNotificationSettings::notifyOnCustomerReply(),
            'staff_reply' => SupportNotificationSettings::notifyOnStaffReply(),
            'assigned' => SupportNotificationSettings::notifyOnAssignment(),
            default => false,
        };
    }
}
