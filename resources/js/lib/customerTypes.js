import { t } from './i18n';

export const CUSTOMER_TYPE_IDS = ['individual', 'vzw', 'company', 'gov'];

export function customerTypeLabel(type) {
    const map = {
        individual: 'customers.type_individual',
        vzw: 'customers.type_vzw',
        company: 'customers.type_company',
        gov: 'customers.type_gov',
        organization: 'customers.type_company',
    };
    const key = map[type] || 'customers.type_individual';
    return t(key);
}

export function customerTypeOptions() {
    return CUSTOMER_TYPE_IDS.map((id) => ({
        value: id,
        label: customerTypeLabel(id),
    }));
}

export function isOrgLikeType(type) {
    return type && type !== 'individual';
}
