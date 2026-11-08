export async function lookupPeppolParticipant(vat, countryCode) {
    const params = new URLSearchParams({
        vat: String(vat || '').trim(),
        country: countryCode ? String(countryCode).slice(0, 2) : '',
    });
    const response = await fetch(`/customers/peppol-lookup?${params.toString()}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        return { found: false, name: null, participant_id: null, error: 'unavailable' };
    }
    const data = payload?.data || {};
    return {
        found: Boolean(data.found),
        name: data.name || null,
        participant_id: data.participant_id || null,
        error: data.error || null,
    };
}
