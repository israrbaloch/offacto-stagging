<?php

namespace App\Support;

/**
 * Belgian structured payment communication (gestructureerde mededeling / OGM).
 * Twelve digits: ten-digit base plus a mod-97 check, shown as +++xxx/xxxx/xxxxx+++.
 */
final class BelgianPaymentReference
{
    public static function fromDocument(?string $documentNumber, ?int $fallbackId = null): ?string
    {
        $digits = preg_replace('/\D/', '', (string) $documentNumber) ?? '';
        if ($digits === '' && $fallbackId) {
            $digits = (string) $fallbackId;
        }
        if ($digits === '') {
            return null;
        }
        if (strlen($digits) > 10) {
            $digits = substr($digits, -10);
        }

        $base = str_pad($digits, 10, '0', STR_PAD_LEFT);
        $check = (int) $base % 97;
        if ($check === 0) {
            $check = 97;
        }
        $full = $base.str_pad((string) $check, 2, '0', STR_PAD_LEFT);

        return '+++'.substr($full, 0, 3).'/'.substr($full, 3, 4).'/'.substr($full, 7, 5).'+++';
    }

    public static function formatIban(?string $iban): string
    {
        $compact = strtoupper(preg_replace('/\s+/', '', (string) $iban) ?? '');
        if ($compact === '') {
            return '';
        }

        return trim(implode(' ', str_split($compact, 4)));
    }
}
