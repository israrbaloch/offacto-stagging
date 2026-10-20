<?php

namespace App\Support;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Offer;
use App\Models\SiteSetting;

final class WhatsAppShare
{
    public static function shareConfigured(?Company $company): bool
    {
        if (! IntegrationPolicy::whatsappShareEnabled()) {
            return false;
        }

        return CompanyIntegrations::whatsappEnabled($company);
    }

    public static function invoiceShareText(Invoice $invoice): ?string
    {
        $invoice->loadMissing(['company.companySetting', 'customer']);
        $company = $invoice->company;
        if (! $company || ! self::shareConfigured($company)) {
            return null;
        }

        return self::renderTemplate(
            self::invoiceTemplate($company),
            self::invoicePlaceholders($invoice),
        );
    }

    public static function offerShareText(Offer $offer): ?string
    {
        $offer->loadMissing(['company.companySetting', 'customer']);
        $company = $offer->company;
        if (! $company || ! self::shareConfigured($company)) {
            return null;
        }

        if (! $offer->share_token) {
            $offer->update(['share_token' => \Illuminate\Support\Str::random(40)]);
            $offer->refresh();
        }

        return self::renderTemplate(
            self::quotationTemplate($company),
            self::offerPlaceholders($offer),
        );
    }

    public static function shareUrlForInvoice(Invoice $invoice): ?string
    {
        $text = self::invoiceShareText($invoice);
        if ($text === null) {
            return null;
        }

        $invoice->loadMissing(['company.companySetting', 'customer']);

        return self::buildWaMeUrl(self::recipientPhone($invoice->company, $invoice->customer), $text);
    }

    public static function shareUrlForOffer(Offer $offer): ?string
    {
        $text = self::offerShareText($offer);
        if ($text === null) {
            return null;
        }

        $offer->loadMissing(['company.companySetting', 'customer']);

        return self::buildWaMeUrl(self::recipientPhone($offer->company, $offer->customer), $text);
    }

    /**
     * @return array<string, string>
     */
    private static function invoicePlaceholders(Invoice $invoice): array
    {
        $companyName = $invoice->company?->company_name ?? 'Your supplier';

        return [
            'number' => (string) ($invoice->invoice_number ?? $invoice->id),
            'company' => $companyName,
            'link' => $invoice->publicUrl(),
            'amount' => number_format((float) $invoice->amount_due, 2),
            'due_date' => $invoice->due_date?->format('Y-m-d') ?? '',
        ];
    }

    /**
     * @return array<string, string>
     */
    private static function offerPlaceholders(Offer $offer): array
    {
        $companyName = $offer->company?->company_name ?? 'Your supplier';

        return [
            'number' => (string) ($offer->offer_number ?? $offer->id),
            'company' => $companyName,
            'link' => $offer->publicUrl(),
            'amount' => number_format((float) $offer->total, 2),
            'due_date' => $offer->valid_until?->format('Y-m-d') ?? '',
        ];
    }

    private static function invoiceTemplate(Company $company): string
    {
        $custom = trim((string) ($company->companySetting?->whatsapp_invoice_template ?? ''));
        if ($custom !== '') {
            return $custom;
        }

        return self::platformTemplate('invoice');
    }

    private static function quotationTemplate(Company $company): string
    {
        $custom = trim((string) ($company->companySetting?->whatsapp_quotation_template ?? ''));
        if ($custom !== '') {
            return $custom;
        }

        return self::platformTemplate('quotation');
    }

    private static function platformTemplate(string $key): string
    {
        $templates = SiteSetting::get('int_whatsapp_templates', []);
        if (is_string($templates)) {
            $templates = json_decode($templates, true) ?: [];
        }
        if (! is_array($templates)) {
            $templates = [];
        }

        $defaults = [
            'invoice' => 'Invoice {{number}} from {{company}} — {{amount}} due {{due_date}}. {{link}}',
            'quotation' => 'Quotation {{number}} from {{company}}: {{link}}',
        ];

        return (string) ($templates[$key] ?? $defaults[$key] ?? $defaults['invoice']);
    }

    /**
     * @param  array<string, string>  $placeholders
     */
    private static function renderTemplate(string $template, array $placeholders): string
    {
        $out = $template;
        foreach ($placeholders as $key => $value) {
            $out = str_replace(['{{'.$key.'}}', '{{ '.$key.' }}'], $value, $out);
        }

        return trim($out);
    }

    private static function recipientPhone(Company $company, ?Customer $customer): ?string
    {
        $settings = $company->companySetting;
        if ($settings?->whatsapp_use_customer_phone && $customer?->phone) {
            $digits = self::normalizePhoneDigits($customer->phone);
            if ($digits !== '') {
                return $digits;
            }
        }

        if (filled($settings?->whatsapp_business_phone)) {
            return self::normalizePhoneDigits($settings->whatsapp_business_phone);
        }

        return null;
    }

    private static function normalizePhoneDigits(string $phone): string
    {
        return preg_replace('/\D+/', '', $phone) ?? '';
    }

    private static function buildWaMeUrl(?string $phoneDigits, string $text): string
    {
        $encoded = rawurlencode($text);
        if ($phoneDigits !== null && $phoneDigits !== '') {
            return 'https://wa.me/'.$phoneDigits.'?text='.$encoded;
        }

        return 'https://wa.me/?text='.$encoded;
    }
}
