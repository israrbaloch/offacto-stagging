/** @typedef {{ text?: string, url?: string, path?: string, markdown?: string, rows?: string[][] }} OfferBlockContent */

export function blockImageUrl(content) {
    if (!content) {
        return null;
    }
    if (content.url) {
        return content.url;
    }
    if (content.path) {
        return `/storage/${String(content.path).replace(/^\//, '')}`;
    }
    return null;
}

/**
 * @param {OfferBlockContent | null | undefined} content
 * @returns {string[][]}
 */
export function tableRowsFromContent(content) {
    if (content?.rows?.length) {
        return content.rows.map((row) => (Array.isArray(row) ? row.map(String) : [String(row)]));
    }
    const legacy = content?.markdown || content?.text;
    if (legacy) {
        return String(legacy)
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => {
                const parts = line.split('|').map((cell) => cell.trim()).filter(Boolean);
                return parts.length ? parts : [line.trim()];
            });
    }
    return [
        ['Column 1', 'Column 2'],
        ['', ''],
    ];
}

export function emptyTableRows(cols = 2, bodyRows = 2) {
    const header = Array.from({ length: cols }, (_, i) => (i === 0 ? 'Column 1' : `Column ${i + 1}`));
    const body = Array.from({ length: bodyRows }, () => Array.from({ length: cols }, () => ''));
    return [header, ...body];
}
