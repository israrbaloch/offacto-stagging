<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoicePayment;
use App\Models\SubscriptionPayment;
use App\Support\CompanyIntegrations;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MolliePaymentService
{
    /**
     * Create (or refresh) a Mollie checkout for an unpaid invoice. Uses the company's integration keys.
     */
    public function createCheckout(Invoice $invoice, Company $company): ?string
    {
        $apiKey = $this->resolveApiKey($company);
        if (! $apiKey) {
            throw new \RuntimeException('Mollie API key is not configured for this company.');
        }

        if ($invoice->isPaid()) {
            return $invoice->mollie_checkout_url;
        }

        $amountDue = (float) $invoice->amount_due;
        if ($amountDue <= 0) {
            return null;
        }

        $payload = [
            'amount' => [
                'currency' => 'EUR',
                'value' => number_format($amountDue, 2, '.', ''),
            ],
            'description' => 'Invoice '.($invoice->invoice_number ?? $invoice->id),
            'redirectUrl' => route('payments.mollie.return', absolute: true),
            'metadata' => [
                'invoice_id' => (string) $invoice->id,
                'company_id' => (string) $company->id,
                'type' => 'invoice',
            ],
        ];

        $webhookUrl = app(PlatformMollieService::class)->resolveWebhookUrl();
        if ($webhookUrl !== null) {
            $payload['webhookUrl'] = $webhookUrl;
        } else {
            Log::info('Mollie webhook URL omitted (local dev). Set MOLLIE_WEBHOOK_URL to a public URL or open the invoice after payment to sync.');
        }

        $response = Http::withToken($apiKey)->post('https://api.mollie.com/v2/payments', $payload);

        if (! $response->successful()) {
            Log::warning('Mollie invoice checkout failed', [
                'invoice_id' => $invoice->id,
                'body' => $response->json(),
            ]);
            throw new \RuntimeException('Mollie payment could not be created.');
        }

        $data = $response->json();
        $invoice->update([
            'mollie_payment_id' => $data['id'] ?? null,
            'mollie_checkout_url' => $data['_links']['checkout']['href'] ?? null,
        ]);

        return $invoice->mollie_checkout_url;
    }

    /**
     * Webhook entry: subscription (platform) or invoice (company keys).
     */
    public function handleWebhook(string $paymentId): void
    {
        if (SubscriptionPayment::where('mollie_payment_id', $paymentId)->exists()) {
            app(PlatformMollieService::class)->syncPaymentStatus($paymentId);

            return;
        }

        $this->syncInvoicePayment($paymentId);
    }

    /**
     * Poll Mollie and record an invoice payment when status is paid (idempotent).
     */
    public function syncInvoicePayment(string $paymentId): bool
    {
        $invoice = Invoice::where('mollie_payment_id', $paymentId)->first();
        if (! $invoice) {
            return false;
        }

        if (InvoicePayment::where('reference', $paymentId)->exists()) {
            $invoice->refresh();
            $invoice->updatePaymentStatus();

            return true;
        }

        $company = $invoice->company;
        $apiKey = $this->resolveApiKey($company);
        if (! $apiKey) {
            Log::warning('Mollie sync skipped: no API key for company', ['company_id' => $company?->id]);

            return false;
        }

        $response = Http::withToken($apiKey)->get("https://api.mollie.com/v2/payments/{$paymentId}");
        if (! $response->successful()) {
            return false;
        }

        $status = $response->json('status') ?? '';
        if ($status !== 'paid') {
            return false;
        }

        $paidAmount = (float) ($response->json('amount.value') ?? $invoice->amount_due);

        InvoicePayment::create([
            'invoice_id' => $invoice->id,
            'amount' => $paidAmount,
            'payment_date' => now(),
            'payment_method' => 'mollie',
            'reference' => $paymentId,
            'notes' => 'Recorded automatically from Mollie',
        ]);

        $invoice->refresh();
        $invoice->updatePaymentStatus();

        return true;
    }

    /**
     * Ensure checkout exists when sending by email (online payment link in message).
     */
    public function ensureCheckoutForSend(Invoice $invoice, Company $company, bool $mollieChannelSelected): void
    {
        if ($invoice->isPaid() || ! CompanyIntegrations::mollieConfigured($company)) {
            return;
        }

        if (filled($invoice->mollie_payment_id)) {
            $this->syncInvoicePayment($invoice->mollie_payment_id);
            $invoice->refresh();
            if ($invoice->isPaid()) {
                return;
            }
        }

        if (! filled($invoice->mollie_checkout_url) || $mollieChannelSelected) {
            $this->createCheckout($invoice, $company);
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
