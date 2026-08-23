<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CompanySubmittedConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Company $company
    ) {}

    public function envelope(): Envelope
    {
        $siteName = SiteSetting::get('site_name', 'Offacto');
        return new Envelope(
            subject: "[{$siteName}] Company Submitted for Approval: {$this->company->company_name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.company-submitted-confirmation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
