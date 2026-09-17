<?php

namespace App\Services;

use App\Models\Invoice;
use Illuminate\Support\Facades\Http;

class PeppolSendService
{
    public function send(Invoice $invoice): void
    {
        $endpoint = config('services.peppol.endpoint');
        $token = config('services.peppol.token');

        if (! $endpoint || ! $token) {
            throw new \RuntimeException('Peppol test credentials are not configured.');
        }

        $ubl = (new UblInvoiceService())->generate($invoice);

        $response = Http::withToken($token)
            ->acceptJson()
            ->post($endpoint, [
                'document' => base64_encode($ubl),
                'filename' => 'invoice-'.($invoice->invoice_number ?? $invoice->id).'.xml',
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Peppol network rejected the invoice.');
        }

        $invoice->update(['peppol_sent_at' => now()]);
    }
}
