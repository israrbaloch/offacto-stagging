import { AdminBadge, AdminDl, AdminDlRow, AdminTextButton, badgeToneFor } from '../ui';

/** SH-007 — slide-over audit entry inspector. */
export default function AdminAuditDetailDrawer({ open, onClose, entry }) {
    if (!open || !entry) return null;

    const meta = entry.metadata && typeof entry.metadata === 'object' ? entry.metadata : {};

    return (
        <div className="fixed inset-0 z-[115] flex justify-end">
            <button type="button" className="absolute inset-0 bg-slate-900/30" aria-label="Close audit detail" onClick={onClose} />
            <aside className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-900">Audit detail</h2>
                    <AdminTextButton type="button" onClick={onClose}>
                        Close
                    </AdminTextButton>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    <AdminDl>
                        <AdminDlRow term="Action">{entry.action}</AdminDlRow>
                        <AdminDlRow term="Outcome">
                            <AdminBadge tone={badgeToneFor(entry.outcome)}>{entry.outcome || '—'}</AdminBadge>
                        </AdminDlRow>
                        <AdminDlRow term="Actor">{entry.user?.name || entry.user?.email || 'System'}</AdminDlRow>
                        <AdminDlRow term="When">{entry.created_at || '—'}</AdminDlRow>
                        <AdminDlRow term="IP">{entry.ip_address || '—'}</AdminDlRow>
                    </AdminDl>
                    {Object.keys(meta).length > 0 && (
                        <div className="mt-6">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Metadata</p>
                            <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(meta, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
