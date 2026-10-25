export const QUOTE_BLOCK_TYPES = [
    { type: 'text', icon: 'text', labelKey: 'offers.block_type_text' },
    { type: 'image', icon: 'img', labelKey: 'offers.block_type_image' },
    { type: 'video', icon: 'video', labelKey: 'offers.block_type_video' },
    { type: 'table', icon: 'table', labelKey: 'offers.block_type_table' },
    { type: 'sign', icon: 'sign', labelKey: 'offers.block_type_sign' },
    { type: 'voice', icon: 'mic', labelKey: 'offers.block_type_voice' },
    { type: 'attachments', icon: 'clip', labelKey: 'offers.block_type_attachments' },
];

export function newClientKey() {
    return `blk-${crypto.randomUUID()}`;
}

export function defaultContentForType(type) {
    switch (type) {
        case 'text':
            return { heading: '', body: '' };
        case 'table':
            return { mode: 'lines' };
        case 'video':
            return { url: '' };
        case 'image':
            return { url: '', path: '' };
        case 'sign':
            return { signer_name: '' };
        case 'voice':
            return {};
        case 'attachments':
            return { path: '', url: '', original_name: '' };
        default:
            return {};
    }
}

export function normalizeBlocks(initialBlocks = [], offerIntro = '') {
    if (initialBlocks.length) {
        return initialBlocks.map((block, index) => ({
            clientKey: block.id ? `id-${block.id}` : newClientKey(),
            type: block.type,
            sort_order: block.sort_order ?? index,
            content: normalizeBlockContent(block.type, block.content || {}),
        }));
    }

    const plainIntro = String(offerIntro || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return [
        {
            clientKey: newClientKey(),
            type: 'text',
            sort_order: 0,
            content: {
                heading: '',
                body: plainIntro,
            },
        },
        {
            clientKey: newClientKey(),
            type: 'table',
            sort_order: 1,
            content: { mode: 'lines' },
        },
    ];
}

function normalizeBlockContent(type, content) {
    if (type === 'text') {
        if (content.heading != null || content.body != null) {
            return { heading: content.heading || '', body: content.body || '' };
        }
        return { heading: '', body: content.text || '' };
    }
    if (type === 'attachments') {
        return {
            path: content.path || '',
            url: content.url || '',
            original_name: content.original_name || '',
        };
    }
    return content;
}

export function blocksToPayload(blocks) {
    return blocks.map((block, index) => ({
        type: block.type,
        sort_order: index,
        content: block.content || {},
    }));
}
