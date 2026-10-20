<?php

namespace App\Services;

use App\Models\Invoice;
use App\Support\CompanyIntegrations;
use Illuminate\Support\Facades\Http;

class PeppolSendService
{
    public function send(Invoice $invoice): void
    {
        $invoice->loadMissing('company.companySetting');
        $company = $invoice->company;

        if (! CompanyIntegrations::peppolEnabled($company)) {
            throw new \RuntimeException('Peppol is disabled for this company.');
        }

        $settings = CompanyIntegrations::settings($company);
        if (! $settings) {
            throw new \RuntimeException('Company settings could not be loaded.');
        }

        $endpoint = CompanyIntegrations::peppolEndpoint($settings);
        $token = CompanyIntegrations::peppolToken($settings);

        if (! $endpoint || ! $token) {
            throw new \RuntimeException('Peppol credentials are not configured.');
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
