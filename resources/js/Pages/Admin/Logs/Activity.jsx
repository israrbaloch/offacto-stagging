import { router } from '@inertiajs/react';
import { useState } from 'react';
import { AdminAuditDetailDrawer, AdminEmptyState } from '../../../Components/Admin/shared';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminHeader,
    AdminPage,
    AdminTable,
    AdminTextButton,
    badgeToneFor,
    inputClass,
} from '../../../Components/Admin/ui';
import Pagination from '../../../Components/Pagination';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

export default function AdminActivityLog({ logs, filters = {} }) {
    const [q, setQ] = useState(filters.q || '');
    const [auditEntry, setAuditEntry] = useState(null);

    const search = (event) => {
        event.preventDefault();
        router.get('/admin/logs/activity', { q }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Activity log">
            <AdminPage>
                <AdminHeader
                    eyebrow="Audit"
                    title="Activity log"
                    description="Platform and admin actions with IP address."
                />
                <AdminBody>
                    <form onSubmit={search} className="mb-6 flex max-w-lg gap-2">
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Action, user, or IP" className={inputClass} />
                        <AdminButton type="submit">Search</AdminButton>
                    </form>
                    <AdminTable columns={['When', 'Actor', 'Action', 'Outcome', 'IP', '']}>
                        {(logs?.data || []).map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3 tabular-nums text-slate-600">{formatDate(row.created_at)}</td>
                                <td className="px-4 py-3">
                                    {row.user ? (
                                        <>
                                            <div className="font-medium text-slate-800">{row.user.name}</div>
                                            <div className="text-xs text-slate-500">{row.user.email}</div>
                                        </>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-700">{row.action}</td>
                                <td className="px-4 py-3">
                                    <AdminBadge tone={badgeToneFor(row.outcome)}>{row.outcome}</AdminBadge>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.ip_address || '—'}</td>
                                <td className="px-4 py-3">
                                    <AdminTextButton type="button" onClick={() => setAuditEntry({ ...row, created_at: formatDate(row.created_at) })}>
                                        Detail
                                    </AdminTextButton>
                                </td>
                            </tr>
                        ))}
                    </AdminTable>
                    {(logs?.data || []).length === 0 && (
                        <div className="mt-4">
                            <AdminEmptyState message="No activity matches your search." />
                        </div>
                    )}
                    <Pagination links={logs?.links || []} />
                </AdminBody>
            </AdminPage>
            <AdminAuditDetailDrawer open={!!auditEntry} onClose={() => setAuditEntry(null)} entry={auditEntry} />
        </AdminLayout>
    );
}
