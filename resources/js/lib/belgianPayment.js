import { t } from './i18n';

/** Belgian OGM: +++xxx/xxxx/xxxxx+++ from the invoice number, mod 97. */
export function belgianStructuredReference(documentNumber, fallbackId) {
    let digits = String(documentNumber || '').replace(/\D/g, '');
    if (!digits && fallbackId) {
        digits = String(fallbackId).replace(/\D/g, '');
    }
    if (!digits) {
        return '';
    }
    if (digits.length > 10) {
        digits = digits.slice(-10);
    }
    const base = digits.padStart(10, '0');
    let check = Number(BigInt(base) % 97n);
    if (check === 0) {
        check = 97;
    }
    const full = base + String(check).padStart(2, '0');
    return `+++${full.slice(0, 3)}/${full.slice(3, 7)}/${full.slice(7)}+++`;
}

export function formatIban(value) {
    const compact = String(value || '').replace(/\s+/g, '').toUpperCase();
    if (!compact) {
        return '';
    }
    return compact.replace(/(.{4})/g, '$1 ').trim();
}

export function formatVatNumber(value) {
    const number = String(value || '').trim();
    if (!number) {
        return '';
    }
    return `${t('invoices.vat')} ${number}`;
}
