<?php

namespace App\Mail\Admin;

use App\Models\Company;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CompanyApproved extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Company $company
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $siteName = SiteSetting::get('site_name', 'Offacto');
        
        return new Envelope(
            subject: "[{$siteName}] Your Company \"{$this->company->company_name}\" Has Been Approved",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.company-approved',
            with: [
                'company' => $this->company,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
