<?php

namespace App\Services;

use App\Models\Company;
use App\Models\CompanySetting;
use App\Support\CompanyIntegrations;
use App\Support\IntegrationPolicy;
use Illuminate\Support\Facades\Http;

class WhatsAppApiService
{
    public function canSend(?Company $company): bool
    {
        if (! IntegrationPolicy::whatsappApiDeliveryEnabled()) {
            return false;
        }

        $settings = CompanyIntegrations::settings($company);
        if (! $settings || ! $settings->whatsapp_api_enabled || ! CompanyIntegrations::whatsappEnabled($company)) {
            return false;
        }

        return filled($settings->whatsapp_api_phone_number_id)
            && filled($settings->whatsapp_api_access_token);
    }

    public function sendText(Company $company, string $recipientE164Digits, string $body): void
    {
        if (! $this->canSend($company)) {
            throw new \RuntimeException('WhatsApp API is not configured for this company.');
        }

        /** @var CompanySetting $settings */
        $settings = CompanyIntegrations::settings($company);
        $phoneNumberId = $settings->whatsapp_api_phone_number_id;
        $token = $settings->whatsapp_api_access_token;

        $to = preg_replace('/\D+/', '', $recipientE164Digits) ?? '';
        if ($to === '') {
            throw new \RuntimeException('Customer phone number is required for WhatsApp API delivery.');
        }

        $response = Http::withToken($token)
            ->acceptJson()
            ->post('https://graph.facebook.com/v21.0/'.$phoneNumberId.'/messages', [
                'messaging_product' => 'whatsapp',
                'to' => $to,
                'type' => 'text',
                'text' => [
                    'preview_url' => true,
                    'body' => mb_substr(strip_tags($body), 0, 4096),
                ],
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('WhatsApp API rejected the message.');
        }
    }
}
