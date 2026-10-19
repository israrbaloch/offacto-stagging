<?php

namespace App\Support;

use App\Models\CompanySetting;
use App\Models\IntegrationApiKey;
use App\Models\IntegrationFailure;
use App\Models\IntegrationProvider;
use App\Models\IntegrationWebhook;
use App\Models\Invoice;
use App\Models\SiteSetting;
use App\Models\SubscriptionPayment;
use App\Services\PlatformMollieService;
use Illuminate\Support\Facades\Http;

final class AdminIntegrationInsights
{
    public static function ensureDefaultProviders(): void
    {
        if (IntegrationProvider::query()->exists()) {
            return;
        }

        foreach ([
            ['slug' => 'mollie', 'name' => 'Mollie', 'purpose' => 'Subscription billing & invoice checkout', 'data_access' => 'Payment metadata, customer redirect'],
            ['slug' => 'postbode', 'name' => 'Postbode', 'purpose' => 'Postal dispatch of PDF documents', 'data_access' => 'Recipient address, document PDF'],
            ['slug' => 'peppol', 'name' => 'Peppol access point', 'purpose' => 'Structured e-invoice transmission', 'data_access' => 'UBL invoice payload, participant IDs'],
            ['slug' => 'email', 'name' => 'Email provider', 'purpose' => 'Transactional email', 'data_access' => 'Recipient email, message content'],
        ] as $row) {
            IntegrationProvider::create([...$row, 'operational_status' => 'active']);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public static function dashboard(): array
    {
        $mollie = app(PlatformMollieService::class);

        return [
            'mollie_configured' => $mollie->isConfigured(),
            'mollie_mode' => $mollie->mode(),
            'peppol_configured' => self::peppolConfigured(),
            'companies_mollie' => CompanySetting::query()->where(function ($q) {
                $q->whereNotNull('mollie_live_key')->orWhereNotNull('mollie_test_key');
            })->count(),
            'companies_postbode' => CompanySetting::query()->where(function ($q) {
                $q->whereNotNull('postbode_live_token')->orWhereNotNull('postbode_test_token');
            })->count(),
            'open_failures' => IntegrationFailure::query()->where('status', 'open')->count(),
            'active_webhooks' => IntegrationWebhook::query()->where('active', true)->count(),
            'active_api_keys' => IntegrationApiKey::query()->whereNull('revoked_at')->count(),
            'failed_payments_7d' => SubscriptionPayment::query()
                ->whereIn('status', ['failed', 'canceled', 'expired'])
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];
    }

    public static function peppolConfigured(): bool
    {
        $endpoint = SiteSetting::get('int_peppol_endpoint') ?: config('services.peppol.endpoint');
        $token = SiteSetting::get('int_peppol_token') ?: config('services.peppol.token');

        return filled($endpoint) && filled($token);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function failureQueue(int $limit = 60): array
    {
        $rows = IntegrationFailure::query()
            ->where('status', 'open')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (IntegrationFailure $f) => [
                'source' => 'queue',
                'id' => $f->id,
                'provider' => $f->provider,
                'operation' => $f->operation,
                'reference' => $f->reference,
                'message' => $f->message,
                'at' => $f->created_at->toIso8601String(),
                'retries' => $f->retry_count,
            ])
            ->all();

        SubscriptionPayment::query()
            ->whereIn('status', ['failed', 'canceled', 'expired'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->each(function (SubscriptionPayment $p) use (&$rows) {
                $rows[] = [
                    'source' => 'subscription',
                    'id' => 'sub-'.$p->id,
                    'provider' => 'mollie',
                    'operation' => 'subscription_checkout',
                    'reference' => $p->mollie_payment_id,
                    'message' => 'Status: '.$p->status,
                    'at' => $p->created_at->toIso8601String(),
                    'retries' => 0,
                ];
            });

        Invoice::query()
            ->where(function ($q) {
                $q->where('postbode_status', 'like', '%fail%')
                    ->orWhere('postbode_status', 'error');
            })
            ->orderByDesc('updated_at')
            ->limit(15)
            ->get(['id', 'invoice_number', 'postbode_status', 'updated_at'])
            ->each(function (Invoice $inv) use (&$rows) {
                $rows[] = [
                    'source' => 'invoice',
                    'id' => 'inv-'.$inv->id,
                    'provider' => 'postbode',
                    'operation' => 'postal_dispatch',
                    'reference' => $inv->invoice_number,
                    'message' => $inv->postbode_status,
                    'at' => $inv->updated_at->toIso8601String(),
                    'retries' => 0,
                ];
            });

        usort($rows, fn ($a, $b) => strcmp($b['at'] ?? '', $a['at'] ?? ''));

        return array_slice($rows, 0, $limit);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function healthChecks(): array
    {
        $checks = [];
        $mollie = app(PlatformMollieService::class);
        $key = $mollie->apiKey();
        if (! $key) {
            $checks[] = ['name' => 'Mollie (platform)', 'status' => 'warn', 'detail' => 'No API key for '.$mollie->mode().' mode.'];
        } else {
            $response = Http::withToken($key)->timeout(8)->get('https://api.mollie.com/v2/payments', ['limit' => 1]);
            $checks[] = [
                'name' => 'Mollie (platform)',
                'status' => $response->successful() ? 'ok' : 'error',
                'detail' => $response->successful() ? 'API reachable ('.$mollie->mode().').' : 'HTTP '.$response->status(),
            ];
        }

        $peppolEndpoint = SiteSetting::get('int_peppol_endpoint') ?: config('services.peppol.endpoint');
        $peppolToken = SiteSetting::get('int_peppol_token') ?: config('services.peppol.token');
        if (! filled($peppolEndpoint) || ! filled($peppolToken)) {
            $checks[] = ['name' => 'Peppol', 'status' => 'warn', 'detail' => 'Endpoint or token not configured.'];
        } else {
            $checks[] = ['name' => 'Peppol', 'status' => 'ok', 'detail' => 'Credentials present (connectivity depends on access point).'];
        }

        $postbodeCompanies = CompanySetting::query()
            ->where(function ($q) {
                $q->whereNotNull('postbode_test_token')->orWhereNotNull('postbode_live_token');
            })
            ->count();
        $checks[] = [
            'name' => 'Postbode (companies)',
            'status' => $postbodeCompanies > 0 ? 'ok' : 'warn',
            'detail' => $postbodeCompanies.' companies with tokens configured.',
        ];

        $mailDriver = SiteSetting::get('int_mail_driver', config('mail.default'));
        $checks[] = [
            'name' => 'Email',
            'status' => $mailDriver === 'log' ? 'warn' : 'ok',
            'detail' => 'Driver: '.$mailDriver,
        ];

        $checks[] = [
            'name' => 'WhatsApp',
            'status' => SiteSetting::getBoolean('int_whatsapp_api_delivery', false) ? 'warn' : 'ok',
            'detail' => SiteSetting::getBoolean('int_whatsapp_api_delivery', false)
                ? 'API delivery flagged on — ensure contractual basis.'
                : 'Share-link workflow only (recommended).',
        ];

        return $checks;
    }
}
