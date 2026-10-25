<?php

namespace App\Support;

use App\Models\CompanySetting;

class CompanyBranding
{
    public static function invoiceLogoWebUrl(?CompanySetting $settings): ?string
    {
        return PublicStorage::url($settings?->invoice_logo);
    }

    public static function invoiceLogoAbsoluteUrl(?CompanySetting $settings): ?string
    {
        return PublicStorage::absoluteUrl($settings?->invoice_logo);
    }

    /** Logo for outbound email HTML when “include logo in emails” is enabled. */
    public static function emailLogoAbsoluteUrl(?CompanySetting $settings): ?string
    {
        if (! ($settings?->logo_in_emails ?? true)) {
            return null;
        }

        if (! filled($settings?->invoice_logo)) {
            return null;
        }

        return PublicStorage::absoluteUrl($settings->invoice_logo);
    }

    /** Local filesystem path for DomPDF (company logo when uploaded). */
    public static function pdfLogoPath(?CompanySetting $settings): ?string
    {
        if (! filled($settings?->invoice_logo)) {
            return null;
        }

        $relative = ltrim($settings->invoice_logo, '/');
        $candidates = [
            storage_path('app/public/'.$relative),
            public_path('storage/'.$relative),
        ];

        foreach ($candidates as $path) {
            if (is_file($path)) {
                return $path;
            }
        }

        return null;
    }

    public static function pdfLogoOrDefault(?CompanySetting $settings): string
    {
        return self::pdfLogoPath($settings) ?? public_path('assets/images/logo-offacto.svg');
    }
}
