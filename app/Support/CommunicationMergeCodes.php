<?php

namespace App\Support;

final class CommunicationMergeCodes
{
    /**
     * @return array<string, array{label: string, contexts: list<string>, description: string}>
     */
    public static function catalog(): array
    {
        return [
            '#CLIENTNAME#' => [
                'label' => 'Client name',
                'contexts' => ['offer', 'invoice', 'reminder'],
                'description' => 'Customer or organisation name on the document.',
            ],
            '#COMPANY#' => [
                'label' => 'Company name',
                'contexts' => ['offer', 'invoice', 'account', 'subscription'],
                'description' => 'Sending company display name.',
            ],
            '#OFFERLINK#' => [
                'label' => 'Quotation link',
                'contexts' => ['offer'],
                'description' => 'Public URL for the quotation.',
            ],
            '#INVOICENUMBER#' => [
                'label' => 'Invoice number',
                'contexts' => ['invoice', 'reminder'],
                'description' => 'Invoice reference number.',
            ],
            '#PAYLINK#' => [
                'label' => 'Payment link',
                'contexts' => ['invoice', 'reminder'],
                'description' => 'Mollie checkout URL when available.',
            ],
        ];
    }

    /**
     * @return list<string>
     */
    public static function codes(): array
    {
        return array_keys(self::catalog());
    }

    /**
     * @return list<string> unknown codes found in text
     */
    public static function unknownIn(string $text): array
    {
        preg_match_all('/#[A-Z0-9_]+#/', $text, $matches);
        $found = array_unique($matches[0] ?? []);
        $allowed = self::codes();

        return array_values(array_diff($found, $allowed));
    }

    public static function sampleMerge(string $text, string $context = 'invoice'): string
    {
        $samples = [
            '#CLIENTNAME#' => 'Sample Client BV',
            '#COMPANY#' => 'Demo Company',
            '#OFFERLINK#' => 'https://offacto.test/q/sample-token',
            '#INVOICENUMBER#' => 'INV-2026-0042',
            '#PAYLINK#' => 'https://pay.example.test/checkout/sample',
        ];

        return str_replace(array_keys($samples), array_values($samples), $text);
    }
}
