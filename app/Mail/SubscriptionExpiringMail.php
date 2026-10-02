<?php

namespace App\Mail;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionExpiringMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Company $company,
        public string $kind,
        public int $daysLeft,
        public ?string $planSlug = null,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->kind === 'trial'
            ? __('subscription.email.trial_subject', ['days' => $this->daysLeft])
            : __('subscription.email.plan_subject', ['days' => $this->daysLeft]);

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription-expiring',
            with: [
                'company' => $this->company,
                'kind' => $this->kind,
                'daysLeft' => $this->daysLeft,
                'planSlug' => $this->planSlug,
                'upgradeUrl' => route('upgrade', absolute: true),
            ],
        );
    }
}
