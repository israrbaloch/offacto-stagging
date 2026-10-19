import { AdminCard, AdminTable } from './ui';

/** Read-only list of built-in personalization codes for email templates. */
export default function CommunicationMergeCodesReference({ mergeCatalog = {}, title = 'Personalization codes', compact = false }) {
    if (!mergeCatalog || !Object.keys(mergeCatalog).length) {
        return null;
    }

    const columns = compact ? ['Code', 'Used for'] : ['Code', 'Name', 'Used in', 'Description'];

    return (
        <AdminCard title={title}>
            <p className="mb-4 text-sm text-slate-600">
                Insert these codes in email subjects or bodies. They are replaced with real customer data when a message is sent.
            </p>
            <AdminTable columns={columns}>
                {Object.entries(mergeCatalog).map(([code, meta]) => (
                    <tr key={code}>
                        <td className="px-4 py-3 font-mono text-xs">{code}</td>
                        {!compact && <td className="px-4 py-3 text-sm">{meta.label}</td>}
                        {!compact && (
                            <td className="px-4 py-3 text-xs text-slate-600">{(meta.contexts || []).join(', ') || '—'}</td>
                        )}
                        <td className="px-4 py-3 text-sm text-slate-600">{compact ? meta.description || meta.label : meta.description}</td>
                    </tr>
                ))}
            </AdminTable>
        </AdminCard>
    );
}
