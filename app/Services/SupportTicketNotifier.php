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
    public function __construct(
        protected AdminNotificationService $adminNotifications,
    ) {}

    public function notify(string $event, SupportTicket $ticket, array $context = []): void
    {
        if (! $this->shouldNotify($event)) {
            return;
        }

        [$title, $body] = $this->copyForEvent($event, $ticket, $context);
        $href = '/admin/support/tickets/'.$ticket->id;

        if (SupportNotificationSettings::notifyAdminInApp()) {
            $this->adminNotifications->notifyPlatformAdmins($title, $body, $href, 'support', [
                'event' => $event,
                'ticket_reference' => $ticket->reference,
            ]);
        }

        $emails = SupportNotificationSettings::allEmailRecipients();
        if ($emails === []) {
            return;
        }

        try {
            PlatformMailConfigurator::apply();
            Mail::to($emails)->send(new SupportTicketStaffNotification($event, $ticket, $context));
        } catch (\Throwable $e) {
            Log::warning('support.ticket.notification_failed', [
                'event' => $event,
                'ticket' => $ticket->reference,
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @return array{0: string, 1: string}
     */
    protected function copyForEvent(string $event, SupportTicket $ticket, array $context): array
    {
        $ref = $ticket->reference;
        $subject = $ticket->subject;

        return match ($event) {
            'new_ticket' => [
                'New support ticket',
                "{$ref}: {$subject}",
            ],
            'customer_reply' => [
                'Customer replied',
                "{$ref}: {$subject}".(! empty($context['snippet']) ? ' — '.$context['snippet'] : ''),
            ],
            'staff_reply' => [
                'Support team replied',
                "{$ref}: {$subject}",
            ],
            'assigned' => [
                'Ticket assigned',
                "{$ref}: {$subject}",
            ],
            default => ['Support update', "{$ref}: {$subject}"],
        };
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
