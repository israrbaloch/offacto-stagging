/** Default workspace theme when company branding is not set. */
export const DEFAULT_BRAND_PRIMARY = '#11134E';
export const DEFAULT_BRAND_SECONDARY = '#7B0033';

export const defaultTheme = {
    primary: DEFAULT_BRAND_PRIMARY,
    secondary: DEFAULT_BRAND_SECONDARY,
};

/** Resolved logo URL for invoice/quote previews (upload preview or saved company logo). */
export function companyInvoiceLogoUrl({ logoPreview, invoiceLogoUrl, companySettings, activeCompany } = {}) {
    if (logoPreview) {
        return logoPreview;
    }
    if (invoiceLogoUrl) {
        return invoiceLogoUrl;
    }
    if (activeCompany?.invoice_logo_url) {
        return activeCompany.invoice_logo_url;
    }
    const path = companySettings?.invoice_logo;
    if (path) {
        return `/storage/${String(path).replace(/^\/+/, '')}`;
    }
    return null;
}

export function themeCssVars(theme = {}) {
    const primary = theme.primary || DEFAULT_BRAND_PRIMARY;
    const accent = theme.secondary || primary;
    return {
        '--brand': primary,
        '--brand-accent': accent,
        '--brand-soft': `${primary}14`,
        '--brand-accent-soft': `${accent}24`,
    };
}
