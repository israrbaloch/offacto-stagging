<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CommunicationTestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $mailSubject,
        public string $bodyHtml,
        public string $templateKey,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Offacto test] '.$this->mailSubject,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->bodyHtml !== ''
                ? $this->bodyHtml
                : '<p>This is a test message for template <strong>'.e($this->templateKey).'</strong>.</p>',
        );
    }
}
