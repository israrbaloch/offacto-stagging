<?php

namespace App\Mail;

use App\Models\Invoice;
use App\Models\SiteSetting;
use App\Support\BrandColors;
use App\Support\CompanyBranding;
use App\Support\CompanyDocumentTemplate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invoice $invoice,
        public string $bodyHtml = '',
        public string $subjectLine = '',
    ) {
    }

    public function envelope(): Envelope
    {
        $subject = $this->subjectLine !== ''
            ? $this->subjectLine
            : 'Payment reminder: Invoice #'.($this->invoice->invoice_number ?? 'N/A');

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        $this->invoice->loadMissing('company.companySetting');
        $settings = $this->invoice->company?->companySetting;
        $theme = BrandColors::resolve(is_array($settings?->theme) ? $settings->theme : null);

        return new Content(
            view: 'emails.invoice-reminder',
            with: [
                'invoice' => $this->invoice,
                'customMessage' => $this->bodyHtml,
                'primaryColor' => $theme['primary'],
                'companyLogoUrl' => CompanyBranding::emailLogoAbsoluteUrl($settings),
            ],
        );
    }

    public function attachments(): array
    {
        $this->invoice->loadMissing(['customer', 'items.service', 'company.companySetting', 'offer', 'blocks']);
        $pdfMeta = CompanyDocumentTemplate::invoicePdf($this->invoice->company);
        $pdf = Pdf::loadView($pdfMeta['view'], [
            'invoice' => $this->invoice,
            'vatRate' => SiteSetting::getInteger('default_vat_rate', 21),
            'layout' => $pdfMeta['layout'],
        ])->setPaper('a4')->output();

        return [
            Attachment::fromData(
                fn () => $pdf,
                'invoice-'.($this->invoice->invoice_number ?? $this->invoice->id).'.pdf'
            )->withMime('application/pdf'),
        ];
    }
}
