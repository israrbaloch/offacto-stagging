import { localeTag, t } from './i18n';

export function money(value) {
    const n = Number(value || 0);
    return new Intl.NumberFormat(localeTag(), {
        style: 'currency',
        currency: 'EUR',
    }).format(n);
}

export function calendarDate(value) {
    if (!value) {
        return null;
    }
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            return null;
        }
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
        return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }
    return date;
}

export function formatCalendarDate(value, locales = localeTag()) {
    if (!value) {
        return '—';
    }
    const date = calendarDate(value);
    if (!date) {
        return String(value);
    }
    return date.toLocaleDateString(locales, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDate(value) {
    return formatCalendarDate(value);
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

export { flashLabel } from './flash';
