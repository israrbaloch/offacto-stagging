export function money(value) {
    const n = Number(value || 0);
    return new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: 'EUR',
    }).format(n);
}

export function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
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
    const map = {
        'profile-updated': 'Profile updated.',
        'company-updated': 'Company updated.',
        'company-settings-updated': 'Company settings updated.',
        'company-created': 'Company created.',
        'customer-created': 'Customer created.',
        'customer-updated': 'Customer updated.',
        'customer-deleted': 'Customer deleted.',
        'service-created': 'Service created.',
        'service-updated': 'Service updated.',
        'service-deleted': 'Service deleted.',
        'offer-created': 'Offer created.',
        'offer-updated': 'Offer updated.',
        'offer-deleted': 'Offer deleted.',
        'offer-sent': 'Offer sent.',
        'invoice-created': 'Invoice created.',
        'invoice-updated': 'Invoice updated.',
        'invoice-deleted': 'Invoice deleted.',
        'invoice-sent': 'Invoice sent.',
        'payment-recorded': 'Payment recorded.',
        'settings-updated': 'Settings updated.',
        'user-updated': 'User updated.',
        'user-activated': 'User activated.',
        'user-deactivated': 'User deactivated.',
        'role-updated': 'Role updated.',
        'company-approved': 'Company approved.',
        'company-rejected': 'Company rejected.',
        'service-approved': 'Service approved.',
        'service-rejected': 'Service rejected.',
    };
    return map[status] || String(status);
}
