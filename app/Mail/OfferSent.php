<?php

namespace App\Mail;

use App\Models\Offer;
use App\Models\SiteSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OfferSent extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Offer $offer,
        public string $message = ''
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Offer #' . ($this->offer->offer_number ?? 'N/A') . ' from ' . $this->offer->company->company_name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.offer-sent',
            with: [
                'offer' => $this->offer,
                'customMessage' => $this->message,
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
        $this->offer->loadMissing(['customer', 'items.service', 'company.companySetting']);

        $pdf = Pdf::loadView('pdf.offer', [
            'offer' => $this->offer,
            'vatRate' => SiteSetting::getInteger('default_vat_rate', 21),
        ])->setPaper('a4')->output();

        return [
            Attachment::fromData(fn () => $pdf, 'quotation-'.($this->offer->offer_number ?? $this->offer->id).'.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
