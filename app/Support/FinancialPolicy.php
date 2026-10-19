<?php

namespace App\Support;

use App\Models\SiteSetting;

/**
 * Platform financial document policies (Belgium-oriented defaults).
 */
final class FinancialPolicy
{
    public static function invoiceLockTrigger(): string
    {
        return SiteSetting::get('fin_invoice_lock_trigger', 'on_first_send');
    }

    public static function correctionsViaCreditNoteOnly(): bool
    {
        return SiteSetting::get('fin_invoice_correction_method', 'credit_note_only') === 'credit_note_only';
    }

    public static function validationRules(): array
    {
        $raw = SiteSetting::get('fin_validation_rules', null);
        if (is_array($raw)) {
            return $raw;
        }
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);

            return is_array($decoded) ? $decoded : [];
        }

        return (array) (FinancialDocumentSettingsRegistry::definition('invoice-validation')['fields'][0]['default'] ?? []);
    }

    public static function defaultQuoteValidityDays(): int
    {
        return SiteSetting::getInteger('fin_quote_default_validity_days', 30);
    }

    public static function jurisdiction(): string
    {
        return SiteSetting::get('fin_default_jurisdiction', 'BE');
    }
}
