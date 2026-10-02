<?php

namespace App\Mail;

use App\Models\Briefing;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BriefingShareMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Briefing $briefing,
        public string $shareUrl,
        public ?string $personalMessage = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('briefings.share_email.subject', ['title' => $this->briefing->title]),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.briefing-share',
            with: [
                'briefing' => $this->briefing,
                'shareUrl' => $this->shareUrl,
                'personalMessage' => $this->personalMessage,
            ],
        );
    }
}
