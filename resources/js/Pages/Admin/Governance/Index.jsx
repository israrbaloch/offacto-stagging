import { Link } from '@inertiajs/react';
import { AdminBody, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function GovernanceIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Governance">
            <AdminPage>
                <AdminHeader eyebrow="Platform" title="Advanced operations & governance" description="Bulk ops, imports, audit, approvals, and environment controls." />
                <AdminBody className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminMetric label="Environment" value={metrics.environment ?? '—'} accent={metrics.environment === 'production'} />
                        <AdminMetric label="Pending approvals" value={metrics.pending_approvals ?? 0} accent={!!metrics.pending_approvals} />
                        <AdminMetric label="Scheduled changes" value={metrics.scheduled_changes ?? 0} />
                        <AdminMetric label="Open exports" value={metrics.open_exports ?? 0} />
                        <AdminMetric label="Bulk drafts" value={metrics.draft_bulk ?? 0} />
                        <AdminMetric label="Reconciliation flags" value={metrics.reconciliation_flags ?? 0} accent={!!metrics.reconciliation_flags} />
                    </div>

                    {groups.map((group) => (
                        <section key={group.group}>
                            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.group}</h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((item) => (
                                    <Link key={item.id} href={item.href} className="block rounded-2xl border border-slate-200/70 bg-white p-4 transition hover:ring-1 hover:ring-slate-900/10">
                                        <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                                        <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
