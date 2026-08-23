<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceSent extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The PDF content as raw bytes.
     */
    private ?string $pdfContent;

    /**
     * The UBL XML content.
     */
    private ?string $ublContent;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Invoice $invoice,
        public string $customMessage = '',
        ?string $pdfContent = null,
        ?string $ublContent = null
    ) {
        $this->pdfContent = $pdfContent;
        $this->ublContent = $ublContent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice #' . ($this->invoice->invoice_number ?? 'N/A') . ' from ' . $this->invoice->company->company_name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice-sent',
            with: [
                'invoice' => $this->invoice,
                'customMessage' => $this->customMessage,
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
        $attachments = [];

        // Attach PDF if provided
        if ($this->pdfContent) {
            $pdfFilename = 'invoice-' . ($this->invoice->invoice_number ?? $this->invoice->id) . '.pdf';
            $attachments[] = Attachment::fromData(fn () => $this->pdfContent, $pdfFilename)
                ->withMime('application/pdf');
        }

        // Attach UBL XML if provided
        if ($this->ublContent) {
            $xmlFilename = 'invoice-' . ($this->invoice->invoice_number ?? $this->invoice->id) . '.xml';
            $attachments[] = Attachment::fromData(fn () => $this->ublContent, $xmlFilename)
                ->withMime('application/xml');
        }

        return $attachments;
    }
}
