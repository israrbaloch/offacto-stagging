export function roundCents(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return 0;
    }

    return Math.round(amount * 100) / 100;
}

export function lineAmount(quantity, price) {
    return roundCents(Number(quantity || 0) * Number(price || 0));
}

export function vatAmount(subtotal, vatRate) {
    const cents = Math.round(Number(subtotal || 0) * 100);
    const rate = Number(vatRate) || 0;

    return Math.round((cents * rate) / 100) / 100;
}

export function totalAmount(subtotal, vat) {
    return roundCents(Number(subtotal || 0) + Number(vat || 0));
}

export function subtotalFromLines(items = []) {
    return roundCents(items.reduce((sum, item) => sum + lineAmount(item.quantity, item.price ?? item.unit_price), 0));
}
