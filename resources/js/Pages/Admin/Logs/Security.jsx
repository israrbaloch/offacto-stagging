import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminHeader,
    AdminPage,
    AdminTable,
    badgeToneFor,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import Pagination from '../../../Components/Pagination';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

export default function AdminSecurityLog({ events, filters = {} }) {
    const [q, setQ] = useState(filters.q || '');
    const [type, setType] = useState(filters.type || '');

    const search = (event) => {
        event.preventDefault();
        router.get('/admin/logs/security', { q, type }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Security log">
            <AdminPage>
                <AdminHeader eyebrow="Audit" title="Security log" description="Failed logins, lockouts, and blocked sign-in attempts." />
                <AdminBody>
                    <form onSubmit={search} className="mb-6 flex flex-wrap gap-2">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Email, event, or IP"
                            className={`${inputClass} min-w-[200px] flex-1`}
                        />
                        <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
                            <option value="">All events</option>
                            <option value="login_failed">login_failed</option>
                            <option value="login_lockout">login_lockout</option>
                            <option value="login_success">login_success</option>
                            <option value="login_blocked_inactive">login_blocked_inactive</option>
                        </select>
                        <AdminButton type="submit">Search</AdminButton>
                    </form>
                    <AdminTable columns={['When', 'Event', 'Email', 'Outcome', 'IP']}>
                        {(events?.data || []).map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3 tabular-nums text-slate-600">{formatDate(row.created_at)}</td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-700">{row.event_type}</td>
                                <td className="px-4 py-3 text-slate-800">{row.email || row.user?.email || '—'}</td>
                                <td className="px-4 py-3">
                                    <AdminBadge tone={badgeToneFor(row.outcome)}>{row.outcome}</AdminBadge>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.ip_address || '—'}</td>
                            </tr>
                        ))}
                    </AdminTable>
                    <Pagination links={events?.links || []} />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
