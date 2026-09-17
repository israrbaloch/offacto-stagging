<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoicePayment;
use Illuminate\Support\Facades\Http;

class MolliePaymentService
{
    public function createCheckout(Invoice $invoice, Company $company): ?string
    {
        $apiKey = $company->mollie_test_key ?: $company->mollie_key;
        if (! $apiKey) {
            throw new \RuntimeException('Mollie API key is not configured for this company.');
        }

        $response = Http::withToken($apiKey)
            ->post('https://api.mollie.com/v2/payments', [
                'amount' => [
                    'currency' => 'EUR',
                    'value' => number_format((float) $invoice->amount_due, 2, '.', ''),
                ],
                'description' => 'Invoice '.($invoice->invoice_number ?? $invoice->id),
                'redirectUrl' => route('invoices.show', $invoice->id),
                'webhookUrl' => route('webhooks.mollie'),
                'metadata' => [
                    'invoice_id' => $invoice->id,
                    'company_id' => $company->id,
                ],
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Mollie payment could not be created.');
        }

        $data = $response->json();
        $invoice->update([
            'mollie_payment_id' => $data['id'] ?? null,
            'mollie_checkout_url' => $data['_links']['checkout']['href'] ?? null,
        ]);

        return $invoice->mollie_checkout_url;
    }

    public function handleWebhook(string $paymentId): void
    {
        $invoice = Invoice::where('mollie_payment_id', $paymentId)->first();
        if (! $invoice) {
            return;
        }

        $company = $invoice->company;
        $apiKey = $company?->mollie_test_key ?: $company?->mollie_key;
        if (! $apiKey) {
            return;
        }

        $response = Http::withToken($apiKey)->get("https://api.mollie.com/v2/payments/{$paymentId}");
        if (! $response->successful()) {
            return;
        }

        if (($response->json('status') ?? '') === 'paid') {
            InvoicePayment::create([
                'invoice_id' => $invoice->id,
                'amount' => $invoice->amount_due,
                'payment_date' => now(),
                'payment_method' => 'mollie',
                'reference' => $paymentId,
            ]);
            $invoice->refresh();
            $invoice->updatePaymentStatus();
        }
    }
}
