/** @typedef {'peppol'|'mollie'|'vies'|'intervat'|'whatsapp'|'postbode'} IntegrationId */

/**
 * @param {Record<string, unknown>} integrations
 * @param {IntegrationId} id
 */
export function integrationIsConnected(integrations, id) {
    switch (id) {
        case 'peppol':
            return !!integrations.peppol_configured;
        case 'mollie':
            return !!integrations.mollie_configured;
        case 'vies':
            return integrations.vies_platform_enabled !== false;
        case 'intervat':
            return integrations.intervat_platform_enabled !== false;
        case 'whatsapp':
            return !!integrations.whatsapp_configured;
        case 'postbode':
            return !!integrations.postbode_configured;
        default:
            return false;
    }
}

/** @type {Array<{ id: IntegrationId, mark: string, markTone: string, titleKey: string, descKey: string }>} */
export const COMPANY_INTEGRATION_CATALOG = [
    {
        id: 'peppol',
        mark: 'P',
        markTone: 'peppol',
        titleKey: 'integrations.catalog_peppol_title',
        descKey: 'integrations.catalog_peppol_desc',
    },
    {
        id: 'mollie',
        mark: 'M',
        markTone: 'mollie',
        titleKey: 'integrations.catalog_mollie_title',
        descKey: 'integrations.catalog_mollie_desc',
    },
    {
        id: 'vies',
        mark: 'V',
        markTone: 'vies',
        titleKey: 'integrations.catalog_vies_title',
        descKey: 'integrations.catalog_vies_desc',
    },
    {
        id: 'intervat',
        mark: 'I',
        markTone: 'intervat',
        titleKey: 'integrations.catalog_intervat_title',
        descKey: 'integrations.catalog_intervat_desc',
    },
    {
        id: 'whatsapp',
        mark: 'W',
        markTone: 'whatsapp',
        titleKey: 'integrations.catalog_whatsapp_title',
        descKey: 'integrations.catalog_whatsapp_desc',
    },
    {
        id: 'postbode',
        mark: 'PB',
        markTone: 'postbode',
        titleKey: 'integrations.catalog_postbode_title',
        descKey: 'integrations.catalog_postbode_desc',
    },
];
