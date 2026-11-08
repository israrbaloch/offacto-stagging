export function visiblePreviewLines(items = []) {
    return items.filter((item) => {
        if (item.kind === 'text') {
            return false;
        }
        const serviceName = String(item.service_name || '').trim();
        const description = String(item.description || '').trim();
        return Boolean(serviceName || item.service_id || description);
    });
}

export default function InvoiceLineLabel({ item }) {
    const description = String(item?.description || '').trim();
    const serviceName = String(item?.service_name || '').trim();
    const title = serviceName || description || '—';
    const detail = serviceName && description && description !== serviceName ? description : '';

    return (
        <span className="offacto-demo-line-label">
            <span>{title}</span>
            {detail ? <span className="offacto-demo-paper-muted offacto-demo-line-detail">{detail}</span> : null}
        </span>
    );
}
