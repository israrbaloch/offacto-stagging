<?php

namespace App\Services;

use App\Models\Company;
use App\Models\SiteSetting;
use App\Models\SubscriptionPayment;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PlatformMollieService
{
    public function mode(): string
    {
        $mode = SiteSetting::get('payment_mollie_mode', 'test');

        return $mode === 'live' ? 'live' : 'test';
    }

    public function apiKey(): ?string
    {
        $key = $this->mode() === 'live'
            ? SiteSetting::get('payment_mollie_live_key')
            : SiteSetting::get('payment_mollie_test_key');

        return filled($key) ? $key : null;
    }

    public function isConfigured(): bool
    {
        return filled($this->apiKey());
    }

    public function createSubscriptionCheckout(Company $company, SubscriptionPlan $plan): string
    {
        $apiKey = $this->apiKey();
        if (! $apiKey) {
            throw new \RuntimeException('Mollie is not configured. Add API keys in Settings.');
        }

        $payment = SubscriptionPayment::create([
            'company_id' => $company->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'pending',
            'amount_cents' => $plan->price_cents,
            'currency' => $plan->currency,
        ]);

        $value = number_format($plan->price_cents / 100, 2, '.', '');
        $currency = strtoupper((string) $plan->currency);

        $payload = [
            'amount' => [
                'currency' => $currency,
                'value' => $value,
            ],
            'description' => 'Offacto '.ucfirst($plan->slug).' plan',
            'redirectUrl' => route('upgrade.callback', absolute: true),
            'metadata' => [
                'subscription_payment_id' => (string) $payment->id,
                'company_id' => (string) $company->id,
                'plan' => (string) $plan->slug,
            ],
        ];

        $webhookUrl = $this->resolveWebhookUrl();
        if ($webhookUrl !== null) {
            $payload['webhookUrl'] = $webhookUrl;
        }

        $response = Http::withToken($apiKey)->post('https://api.mollie.com/v2/payments', $payload);

        if (! $response->successful()) {
            $payment->update(['status' => 'failed']);
            Log::warning('Mollie subscription checkout failed', [
                'status' => $response->status(),
                'detail' => $response->json('detail'),
                'field' => $response->json('field'),
                'company_id' => $company->id,
                'plan' => $plan->slug,
            ]);
            throw new \RuntimeException('Mollie payment could not be created.');
        }

        $data = $response->json();
        $payment->update([
            'mollie_payment_id' => $data['id'] ?? null,
        ]);

        $checkout = $data['_links']['checkout']['href'] ?? null;
        if (! $checkout) {
            throw new \RuntimeException('Mollie checkout URL missing.');
        }

        return $checkout;
    }

    public function syncPaymentStatus(string $molliePaymentId): void
    {
        $subscriptionPayment = SubscriptionPayment::where('mollie_payment_id', $molliePaymentId)->first();
        if (! $subscriptionPayment) {
            return;
        }

        $apiKey = $this->apiKey();
        if (! $apiKey) {
            return;
        }

        $response = Http::withToken($apiKey)->get("https://api.mollie.com/v2/payments/{$molliePaymentId}");
        if (! $response->successful()) {
            return;
        }

        $status = $response->json('status') ?? '';
        if ($status === 'paid') {
            $subscriptionPayment->markPaid();
        } elseif (in_array($status, ['failed', 'canceled', 'expired'], true)) {
            $subscriptionPayment->update(['status' => $status]);
        }
    }

    public function syncLatestPendingForCompany(Company $company): ?SubscriptionPayment
    {
        $pending = SubscriptionPayment::query()
            ->where('company_id', $company->id)
            ->where('status', 'pending')
            ->whereNotNull('mollie_payment_id')
            ->latest()
            ->first();

        if ($pending?->mollie_payment_id) {
            $this->syncPaymentStatus($pending->mollie_payment_id);
            $pending->refresh();
        }

        return $pending;
    }

    /**
     * Mollie rejects webhook URLs that are not reachable from the internet (e.g. localhost).
     * On local dev, payment status is synced on redirect via upgrade.callback instead.
     */
    public function resolveWebhookUrl(): ?string
    {
        $override = config('services.mollie.webhook_url');
        if (filled($override)) {
            return (string) $override;
        }

        $url = route('webhooks.mollie', absolute: true);
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        if (in_array($host, ['localhost', '127.0.0.1', '[::1]'], true)) {
            return null;
        }

        return $url;
    }
}
