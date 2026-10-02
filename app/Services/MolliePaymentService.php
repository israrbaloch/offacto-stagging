<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoicePayment;
use App\Support\CompanyIntegrations;
use Illuminate\Support\Facades\Http;

class MolliePaymentService
{
    public function createCheckout(Invoice $invoice, Company $company): ?string
    {
        $apiKey = $this->resolveApiKey($company);
        if (! $apiKey) {
            throw new \RuntimeException('Mollie API key is not configured for this company.');
        }

        $payload = [
            'amount' => [
                'currency' => 'EUR',
                'value' => number_format((float) $invoice->amount_due, 2, '.', ''),
            ],
            'description' => 'Invoice '.($invoice->invoice_number ?? $invoice->id),
            'redirectUrl' => route('invoices.show', $invoice->id),
            'metadata' => [
                'invoice_id' => (string) $invoice->id,
                'company_id' => (string) $company->id,
            ],
        ];

        $webhookUrl = app(PlatformMollieService::class)->resolveWebhookUrl();
        if ($webhookUrl !== null) {
            $payload['webhookUrl'] = $webhookUrl;
        }

        $response = Http::withToken($apiKey)->post('https://api.mollie.com/v2/payments', $payload);

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
        app(PlatformMollieService::class)->syncPaymentStatus($paymentId);

        $invoice = Invoice::where('mollie_payment_id', $paymentId)->first();
        if (! $invoice) {
            return;
        }

        $company = $invoice->company;
        $apiKey = $this->resolveApiKey($company);
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

    private function resolveApiKey(?Company $company): ?string
    {
        if (! $company) {
            return null;
        }

        $settings = CompanyIntegrations::settings($company);
        if ($settings) {
            $fromSettings = CompanyIntegrations::mollieApiKey($settings);
            if (filled($fromSettings)) {
                return $fromSettings;
            }
        }

        return $company->mollie_test_key ?? $company->mollie_key ?? null;
    }
}
