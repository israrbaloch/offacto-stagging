import { localeTag, t } from './i18n';

export function money(value) {
    const n = Number(value || 0);
    return new Intl.NumberFormat(localeTag(), {
        style: 'currency',
        currency: 'EUR',
    }).format(n);
}

export function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(localeTag());
}

export function optionsFromMap(map = {}) {
    return Object.entries(map).map(([value, label]) => ({
        value: String(value),
        label: String(label),
    }));
}

export function customerName(customer) {
    if (!customer) return '—';
    const name = [customer.first_name, customer.surname].filter(Boolean).join(' ');
    return customer.org_name ? `${name} (${customer.org_name})` : name || '—';
}

export function flashLabel(status) {
    return t(`flash.${status}`);
}
