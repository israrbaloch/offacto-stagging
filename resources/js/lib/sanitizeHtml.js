const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'P', 'BR', 'DIV', 'SPAN']);

export function sanitizeHtml(html = '') {
    if (!html || typeof window === 'undefined') {
        return String(html || '');
    }

    const template = document.createElement('template');
    template.innerHTML = html;

    const walk = (node) => {
        [...node.childNodes].forEach((child) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                if (!ALLOWED.has(child.tagName)) {
                    child.replaceWith(...child.childNodes);
                    return;
                }
                [...child.attributes].forEach((attr) => child.removeAttribute(attr.name));
                walk(child);
            } else if (child.nodeType === Node.COMMENT_NODE) {
                child.remove();
            }
        });
    };

    walk(template.content);
    return template.innerHTML;
}

export function isPlainText(value = '') {
    return String(value) === String(value).replace(/<[^>]+>/g, '');
}
