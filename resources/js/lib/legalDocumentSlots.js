const TYPE_ALIASES = { contract: 'dpa' };

export const LEGAL_DOCUMENT_SLOTS = [
    { id: 'privacy', labelKey: 'auth.legal_doc_privacy' },
    { id: 'terms', labelKey: 'auth.legal_doc_terms' },
    { id: 'dpa', labelKey: 'auth.legal_doc_dpa' },
    { id: 'other', labelKey: 'profile.other' },
];

export function normalizeLegalDocumentType(type) {
    return TYPE_ALIASES[type] || type;
}

export function legalDocumentForSlot(documents, slotId) {
    const slot = normalizeLegalDocumentType(slotId);
    const list = Array.isArray(documents) ? documents : [];

    const direct = list.find((doc) => normalizeLegalDocumentType(doc.type) === slot);
    if (direct) {
        return direct;
    }

    if (slot === 'privacy') {
        return list.find((doc) => {
            if (normalizeLegalDocumentType(doc.type) !== 'other') {
                return false;
            }
            const title = String(doc.title || '').toLowerCase();
            return title.includes('privacy');
        });
    }

    return null;
}

export function legalDocumentRowLabel(slot, doc, t) {
    const base = t(slot.labelKey);
    if (slot.id !== 'other') {
        return base;
    }
    const extra = doc?.title?.trim();
    return extra ? `${base} · ${extra}` : base;
}
