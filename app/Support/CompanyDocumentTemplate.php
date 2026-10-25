<?php

namespace App\Support;

use App\Models\Company;

class CompanyDocumentTemplate
{
    public static function normalize(?string $template): string
    {
        $key = strtolower(trim((string) $template));

        return match ($key) {
            'minimal' => 'minimal',
            'modern' => 'modern',
            default => 'classic',
        };
    }

    public static function forCompany(?Company $company): string
    {
        return self::normalize($company?->companySetting?->invoice_template);
    }

    /**
     * @return array{view: string, layout: string}
     */
    public static function offerPdf(?Company $company): array
    {
        $template = self::forCompany($company);

        return [
            'view' => in_array($template, ['minimal', 'modern'], true) ? 'pdf.offer-minimal' : 'pdf.offer',
            'layout' => $template === 'modern' ? 'modern' : 'minimal',
        ];
    }

    /**
     * @return array{view: string, layout: string}
     */
    public static function invoicePdf(?Company $company): array
    {
        $template = self::forCompany($company);

        return [
            'view' => in_array($template, ['minimal', 'modern'], true) ? 'pdf.invoice-minimal' : 'pdf.invoice',
            'layout' => $template === 'modern' ? 'modern' : 'minimal',
        ];
    }
}
