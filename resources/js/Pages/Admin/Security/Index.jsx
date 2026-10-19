import { Link } from '@inertiajs/react';
import { AdminBody, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function SecurityIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Security">
            <AdminPage>
                <AdminHeader eyebrow="Platform" title="Security & fraud prevention" description="Policies, monitoring, fraud review, and incident response." />
                <AdminBody className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminMetric label="Failed logins (24h)" value={metrics.failed_logins_24h ?? 0} accent={!!metrics.failed_logins_24h} />
                        <AdminMetric label="Open fraud reviews" value={metrics.open_fraud_reviews ?? 0} />
                        <AdminMetric label="Active restrictions" value={metrics.active_restrictions ?? 0} />
                        <AdminMetric label="Open security incidents" value={metrics.open_incidents ?? 0} />
                        <AdminMetric label="Policy exceptions" value={metrics.active_exceptions ?? 0} />
                        <AdminMetric label="Rotation overdue" value={metrics.rotation_overdue ?? 0} accent={!!metrics.rotation_overdue} />
                        <AdminMetric label="Pending registrations" value={metrics.pending_company_approvals ?? 0} />
                    </div>

                    {groups.map((group) => (
                        <section key={group.group}>
                            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.group}</h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((item) => (
                                    <Link key={item.id} href={item.href} className="group block rounded-2xl border border-slate-200/70 bg-white p-4 transition hover:ring-1 hover:ring-slate-900/10">
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
