<?php

namespace App\Services\Creditsafe;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class CreditsafeClient
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $apiKey,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function companyCreditSummary(string $countryCode, string $registrationNumber): array
    {
        $country = strtoupper($countryCode);
        $regNo = preg_replace('/\s+/', '', $registrationNumber) ?? $registrationNumber;

        $response = Http::timeout(30)
            ->withToken($this->apiKey)
            ->acceptJson()
            ->get(rtrim($this->baseUrl, '/')."/companies/{$country}/{$regNo}/creditsummary")
            ->throw();

        return $response->json() ?? [];
    }

    public static function fromConfig(?string $apiKey): ?self
    {
        if (! filled($apiKey)) {
            return null;
        }

        $base = config('services.creditsafe.base_url');

        return new self((string) $base, $apiKey);
    }
}
