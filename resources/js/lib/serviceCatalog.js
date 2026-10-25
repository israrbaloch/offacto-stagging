import { t } from './i18n';

/** Demo diensten() unit keys: fixed | hour | day | year */
export const CATALOG_UNITS = ['fixed', 'hour', 'day', 'year'];

/** Demo VAT={21,12,6,0,ic,rc,ex44,sme} */
export const VAT_CODES = ['21', '12', '6', '0', 'ic', 'rc', 'ex44', 'sme'];

export function catalogUnitFromService(service) {
    if (!service) {
        return 'fixed';
    }
    if (service.billing_mode === 'hourly' || service.unit === 'hour') {
        return 'hour';
    }
    const unit = String(service.unit || '').toLowerCase();
    if (unit === 'day') {
        return 'day';
    }
    if (unit === 'year') {
        return 'year';
    }
    return 'fixed';
}

export function billingFromCatalogUnit(catalogUnit) {
    switch (catalogUnit) {
        case 'hour':
            return { billing_mode: 'hourly', unit: 'hour' };
        case 'day':
            return { billing_mode: 'fixed', unit: 'day' };
        case 'year':
            return { billing_mode: 'fixed', unit: 'year' };
        default:
            return { billing_mode: 'fixed', unit: null };
    }
}

export function catalogUnitLabel(catalogUnit) {
    const key = `services.unit_${catalogUnit}`;
    const text = t(key);
    return text === key ? catalogUnit : text;
}

export function serviceIconName(service) {
    return catalogUnitFromService(service) === 'hour' ? 'clock' : 'box';
}

export function vatLabel(code) {
    const key = `services.vat_${code}`;
    const text = t(key);
    return text === key ? code : text;
}

export function vatBadgeLabel(code) {
    return `${t('services.vat_short')} ${vatLabel(code)}`;
}
