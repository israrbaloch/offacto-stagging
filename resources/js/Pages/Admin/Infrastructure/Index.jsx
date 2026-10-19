import { Link } from '@inertiajs/react';
import { AdminBody, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function InfrastructureIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Infrastructure">
            <AdminPage>
                <AdminHeader eyebrow="Platform" title="Infrastructure, database & storage" description="Health, queues, backups, storage, and integrity." />
                <AdminBody className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminMetric label="Database" value={metrics.db_ok ? 'Connected' : 'Error'} accent={!metrics.db_ok} />
                        <AdminMetric label="Queue pending" value={metrics.queue_pending ?? 0} accent={!!metrics.queue_pending} />
                        <AdminMetric label="Failed jobs" value={metrics.queue_failed ?? 0} accent={!!metrics.queue_failed} />
                        <AdminMetric label="Integrity flags" value={metrics.integrity_issues ?? 0} accent={!!metrics.integrity_issues} />
                        <AdminMetric label="Public storage (MB)" value={metrics.storage_mb ?? 0} />
                        <AdminMetric label="Maintenance" value={metrics.maintenance_on ? 'On' : 'Off'} accent={!!metrics.maintenance_on} />
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
