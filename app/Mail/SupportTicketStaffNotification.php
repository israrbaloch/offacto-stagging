<?php

namespace App\Mail;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SupportTicketStaffNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $event,
        public SupportTicket $ticket,
        public array $context = [],
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->event) {
            'new_ticket' => '[Support] New ticket '.$this->ticket->reference,
            'customer_reply' => '[Support] Customer reply on '.$this->ticket->reference,
            'staff_reply' => '[Support] Update on '.$this->ticket->reference,
            'assigned' => '[Support] Ticket assigned: '.$this->ticket->reference,
            default => '[Support] '.$this->ticket->reference,
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.support-ticket-staff',
            with: [
                'event' => $this->event,
                'ticket' => $this->ticket,
                'context' => $this->context,
                'adminUrl' => url('/admin/support/tickets/'.$this->ticket->id),
            ],
        );
    }
}
