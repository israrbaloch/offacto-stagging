<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Customer;
use App\Models\CustomerCreditCheck;
use App\Models\User;
use App\Services\Creditsafe\CreditsafeClient;
use App\Support\CompanyIntegrations;
use App\Support\IntegrationPolicy;
use Illuminate\Validation\ValidationException;

class CreditsafeCreditCheckService
{
    public function check(Customer $customer, Company $company, User $user): CustomerCreditCheck
    {
        if (! IntegrationPolicy::creditsafeEnabled()) {
            throw ValidationException::withMessages([
                'creditsafe' => ['Creditsafe is disabled by platform settings.'],
            ]);
        }

        if (! CompanyIntegrations::creditsafeConfigured($company)) {
            throw ValidationException::withMessages([
                'creditsafe' => ['Configure Creditsafe under Company settings → Integrations.'],
            ]);
        }

        $identifier = trim((string) ($customer->vat_number ?? ''));
        if ($identifier === '') {
            throw ValidationException::withMessages([
                'vat_number' => ['Add a VAT or company registration number on the customer before running a credit check.'],
            ]);
        }

        $settings = CompanyIntegrations::settings($company);
        $client = CreditsafeClient::fromConfig(CompanyIntegrations::creditsafeApiKey($settings));
        if (! $client) {
            throw ValidationException::withMessages([
                'creditsafe' => ['Creditsafe API key is missing.'],
            ]);
        }

        $country = 'BE';
        if ($customer->relationLoaded('country') && $customer->country?->code) {
            $country = strtoupper(substr((string) $customer->country->code, 0, 2));
        }

        try {
            $payload = $client->companyCreditSummary($country, $identifier);
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'creditsafe' => ['Creditsafe request failed: '.$e->getMessage()],
            ]);
        }

        $rating = (string) ($payload['rating'] ?? $payload['creditScore']['value'] ?? $payload['score'] ?? '');
        $statusLabel = (string) ($payload['status'] ?? $payload['companyStatus'] ?? $payload['creditLimit']['currency'] ?? '');

        return CustomerCreditCheck::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'requested_by_user_id' => $user->id,
            'provider' => 'creditsafe',
            'identifier_used' => $identifier,
            'rating' => $rating !== '' ? $rating : null,
            'status_label' => $statusLabel !== '' ? $statusLabel : null,
            'response_payload' => $payload,
            'checked_at' => now(),
        ]);
    }
}
