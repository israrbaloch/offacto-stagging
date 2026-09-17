<?php

namespace App\Mail;

use App\Models\Invoice;
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
        public string $customMessage = ''
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment reminder: Invoice #'.($this->invoice->invoice_number ?? 'N/A'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice-reminder',
            with: [
                'invoice' => $this->invoice,
                'customMessage' => $this->customMessage,
            ],
        );
    }

    public function attachments(): array
    {
        $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $this->invoice])->output();

        return [
            Attachment::fromData(
                fn () => $pdf,
                'invoice-'.($this->invoice->invoice_number ?? $this->invoice->id).'.pdf'
            )->withMime('application/pdf'),
        ];
    }
}
