<?php

namespace App\Mail;

use App\Models\CompanyLegalDocument;
use App\Models\Offer;
use App\Models\SiteSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class OfferSent extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<int, CompanyLegalDocument>  $legalDocuments
     */
    public function __construct(
        public Offer $offer,
        public string $message = '',
        public array $legalDocuments = []
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Offer #' . ($this->offer->offer_number ?? 'N/A') . ' from ' . $this->offer->company->company_name,
        );
    }

    public function content(): Content
    {
        $settings = $this->offer->company?->companySetting;
        $theme = is_array($settings?->theme) ? $settings->theme : [];
        $showLogo = (bool) ($settings?->logo_in_emails ?? true)
            && filled($settings?->invoice_logo);

        return new Content(
            view: 'emails.offer-sent',
            with: [
                'offer' => $this->offer,
                'customMessage' => $this->message,
                'primaryColor' => $theme['primary'] ?? '#4054b2',
                'secondaryColor' => $theme['secondary'] ?? '#0f172a',
                'companyLogoUrl' => $showLogo ? asset('storage/'.$settings->invoice_logo) : null,
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        $this->offer->loadMissing(['customer', 'items.service', 'company.companySetting', 'attachments']);

        $pdf = Pdf::loadView('pdf.offer', [
            'offer' => $this->offer,
            'vatRate' => SiteSetting::getInteger('default_vat_rate', 21),
        ])->setPaper('a4')->output();

        $files = [
            Attachment::fromData(fn () => $pdf, 'quotation-'.($this->offer->offer_number ?? $this->offer->id).'.pdf')
                ->withMime('application/pdf'),
        ];

        foreach ($this->offer->attachments as $attachment) {
            if (Storage::disk('public')->exists($attachment->file_path)) {
                $files[] = Attachment::fromStorageDisk('public', $attachment->file_path)
                    ->as($attachment->original_name)
                    ->withMime('application/pdf');
            }
        }

        foreach ($this->legalDocuments as $document) {
            if (Storage::disk('public')->exists($document->file_path)) {
                $files[] = Attachment::fromStorageDisk('public', $document->file_path)
                    ->as($document->original_name)
                    ->withMime('application/pdf');
            }
        }

        return $files;
    }
}
