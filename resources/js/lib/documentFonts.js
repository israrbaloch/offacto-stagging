/** Company document / email font choices (demo instellingen). */
export const DOCUMENT_FONT_OPTIONS = [
    { value: 'inter', labelKey: 'company_settings.font_inter' },
    { value: 'georgia', labelKey: 'company_settings.font_georgia' },
    { value: 'helvetica', labelKey: 'company_settings.font_helvetica' },
    { value: 'courier_new', labelKey: 'company_settings.font_courier_new' },
];

const FONT_STACKS = {
    inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
    georgia: 'Georgia, "Times New Roman", Times, serif',
    helvetica: 'Helvetica, Arial, ui-sans-serif, system-ui, sans-serif',
    courier_new: '"Courier New", Courier, ui-monospace, monospace',
};

export function normalizeDocumentFont(key) {
    const id = String(key || 'inter').toLowerCase();
    return FONT_STACKS[id] ? id : 'inter';
}

export function documentFontFamily(key) {
    return FONT_STACKS[normalizeDocumentFont(key)];
}

export function documentFontCssVar(key) {
    const family = documentFontFamily(key);
    return {
        '--doc-font': family,
        fontFamily: family,
    };
}
