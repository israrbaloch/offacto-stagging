<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class ViesValidationService
{
    private const BASE_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/ms';

    /**
     * @return array{
     *     valid: bool,
     *     country_code: string,
     *     vat_number: string,
     *     name: ?string,
     *     address: ?string,
     *     request_identifier: ?string,
     *     request_date: ?string,
     *     user_error: ?string
     * }
     */
    public function validate(string $vatInput, ?string $fallbackCountryCode = null): array
    {
        $parsed = $this->parseVatNumber($vatInput, $fallbackCountryCode);
        if ($parsed === null) {
            throw ValidationException::withMessages([
                'vat_number' => [__('customers.vies_invalid')],
            ]);
        }

        $url = sprintf(
            '%s/%s/vat/%s',
            self::BASE_URL,
            rawurlencode($parsed['country']),
            rawurlencode($parsed['number']),
        );

        try {
            $response = Http::timeout(20)
                ->acceptJson()
                ->get($url);
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'vat_number' => [__('customers.vies_service_unavailable')],
            ]);
        }

        if (! $response->successful()) {
            throw ValidationException::withMessages([
                'vat_number' => [__('customers.vies_service_unavailable')],
            ]);
        }

        /** @var array<string, mixed> $body */
        $body = $response->json() ?? [];
        $valid = (bool) ($body['isValid'] ?? false);

        return [
            'valid' => $valid,
            'country_code' => $parsed['country'],
            'vat_number' => $parsed['country'].$parsed['number'],
            'name' => $this->cleanField($body['name'] ?? null),
            'address' => $this->cleanField($body['address'] ?? null),
            'request_identifier' => filled($body['requestIdentifier'] ?? null)
                ? (string) $body['requestIdentifier']
                : null,
            'request_date' => filled($body['requestDate'] ?? null)
                ? (string) $body['requestDate']
                : null,
            'user_error' => filled($body['userError'] ?? null)
                ? (string) $body['userError']
                : null,
        ];
    }

    /**
     * @return array{country: string, number: string}|null
     */
    public function parseVatNumber(string $vatInput, ?string $fallbackCountryCode = null): ?array
    {
        $normalized = strtoupper(preg_replace('#[\s.\-_/]+#', '', trim($vatInput)) ?? '');
        if ($normalized === '') {
            return null;
        }

        if (preg_match('/^([A-Z]{2})([A-Z0-9]+)$/', $normalized, $matches)) {
            return [
                'country' => $this->memberStateCode($matches[1]),
                'number' => $matches[2],
            ];
        }

        $fallback = $fallbackCountryCode ? $this->memberStateCode($fallbackCountryCode) : null;
        if ($fallback && preg_match('/^[A-Z0-9]+$/', $normalized)) {
            return [
                'country' => $fallback,
                'number' => $normalized,
            ];
        }

        return null;
    }

    private function memberStateCode(string $code): string
    {
        $code = strtoupper(substr(trim($code), 0, 2));

        return $code === 'GR' ? 'EL' : $code;
    }

    private function cleanField(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);
        if ($trimmed === '' || $trimmed === '---') {
            return null;
        }

        return $trimmed;
    }
}
