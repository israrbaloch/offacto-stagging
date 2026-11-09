function compact(value) {
    return String(value || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
}

export function isPlaceholderEmail(email) {
    const value = String(email || '').trim().toLowerCase();
    if (!value) {
        return true;
    }
    return ['@example.com', '@example.org', '@example.test'].some((domain) => value.endsWith(domain));
}

export function isPlaceholderVat(vat) {
    const value = compact(vat);
    return value === '' || value === 'VAT123456789';
}

export function isPlaceholderAddress(from = {}) {
    const street = String(from.street || '').trim().toLowerCase();
    const city = String(from.city || '').trim().toLowerCase();
    const postal = String(from.postal_code || '').trim();
    return street.includes('123 business street') || (postal === '12345' && city === 'business city');
}

/** Drop seeded placeholder contact details so they are not printed on a document. */
export function publicCompanyProfile(from = {}, vat = '') {
    const addressPlaceholder = isPlaceholderAddress(from);
    const vatPlaceholder = isPlaceholderVat(vat);
    const emailPlaceholder = isPlaceholderEmail(from.email);

    return {
        from: {
            ...from,
            street: addressPlaceholder ? '' : from.street,
            house: addressPlaceholder ? '' : from.house,
            postal_code: addressPlaceholder ? '' : from.postal_code,
            city: addressPlaceholder ? '' : from.city,
            email: emailPlaceholder ? '' : from.email,
        },
        vat: vatPlaceholder ? '' : vat,
        incomplete: addressPlaceholder || vatPlaceholder,
        emailPlaceholder,
    };
}
