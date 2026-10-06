/** @typedef {{ billing_mode?: string, unit?: string } | null | undefined} ServiceLike */

export function isHourlyService(service) {
    if (!service) {
        return false;
    }
    if (service.billing_mode === 'hourly') {
        return true;
    }
    const unit = String(service.unit || '')
        .trim()
        .toLowerCase();
    return unit === 'hour' || unit === 'hours' || unit === 'hr' || unit === 'hrs';
}

export function serviceFromLine(item, services) {
    if (item?.billing_mode === 'hourly') {
        return { billing_mode: 'hourly', unit: item.unit || 'hour' };
    }
    const svc = services.find((s) => String(s.id) === String(item.service_id));
    return svc || null;
}

export function lineIsHourly(item, services) {
    if (item?.kind === 'text') {
        return false;
    }
    if (item?.billing_mode === 'hourly') {
        return true;
    }
    return isHourlyService(serviceFromLine(item, services));
}

export function quantityColumnLabel(items, services) {
    const priced = items.filter((item) => item.kind !== 'text');
    if (priced.length === 0) {
        return 'Quantity';
    }
    const flags = priced.map((item) => lineIsHourly(item, services));
    if (flags.every(Boolean)) {
        return 'Hours';
    }
    if (flags.some(Boolean)) {
        return 'Qty / hours';
    }
    return 'Quantity';
}

export function priceColumnLabel(items, services) {
    const priced = items.filter((item) => item.kind !== 'text');
    if (priced.length === 0) {
        return 'Price (excl. VAT)';
    }
    const flags = priced.map((item) => lineIsHourly(item, services));
    if (flags.every(Boolean)) {
        return 'Rate / hour (excl. VAT)';
    }
    if (flags.some(Boolean)) {
        return 'Price / rate (excl. VAT)';
    }
    return 'Price (excl. VAT)';
}

export function attachServiceFields(item, service) {
    if (!service) {
        return item;
    }
    return {
        ...item,
        billing_mode: service.billing_mode || 'fixed',
        unit: service.unit || '',
    };
}

export function formatQuantityDisplay(item, services) {
    if (item?.kind === 'text') {
        return '—';
    }
    const qty = item.quantity ?? '';
    if (!lineIsHourly(item, services)) {
        return qty;
    }
    return qty === '' ? '' : `${qty} h`;
}
