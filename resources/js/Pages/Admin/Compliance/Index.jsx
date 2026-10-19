import { Link } from '@inertiajs/react';
import { AdminBody, AdminCard, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function ComplianceIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Compliance">
            <AdminPage>
                <AdminHeader
                    eyebrow="Legal & privacy"
                    title="Compliance dashboard"
                    description="Tasks, retention, privacy requests, and lawful authority workflows. No bulk surveillance or automatic disclosure."
                />
                <AdminBody className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminMetric label="Open data subject requests" value={metrics.open_dsar ?? 0} accent={!!metrics.overdue_dsar} hint={metrics.overdue_dsar ? `${metrics.overdue_dsar} overdue` : undefined} />
                        <AdminMetric label="Authority requests pending" value={metrics.pending_authority ?? 0} hint={metrics.emergency_authority ? `${metrics.emergency_authority} emergency` : undefined} />
                        <AdminMetric label="Active legal holds" value={metrics.active_holds ?? 0} />
                        <AdminMetric label="Open breach incidents" value={metrics.open_breaches ?? 0} />
                        <AdminMetric label="Deletion jobs pending" value={metrics.pending_deletion ?? 0} />
                        <AdminMetric label="Restricted cases open" value={metrics.open_cases ?? 0} />
                        <AdminMetric label="Invoices past retention review" value={metrics.retention_review_due ?? 0} />
                    </div>

                    <AdminCard className="border-amber-100 bg-amber-50/50" padding={true}>
                        <p className="text-sm leading-relaxed text-slate-700">
                            <strong className="font-medium text-slate-900">Lawful requests only.</strong> Register authority requests, verify jurisdiction and legal basis, and record disclosures manually. An incoming request is not automatic permission to disclose all data.
                        </p>
                    </AdminCard>

                    {groups.map((group) => (
                        <section key={group.group}>
                            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.group}</h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((item) => {
                                    const href =
                                        item.kind === 'operation'
                                            ? `/admin/compliance/operations/${item.id}`
                                            : `/admin/compliance/${item.id}`;
                                    return (
                                        <Link key={item.id} href={href} className="group block">
                                            <AdminCard className="h-full transition group-hover:ring-1 group-hover:ring-slate-900/10">
                                                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
                                                <span className="mt-4 inline-block text-xs font-medium text-slate-600 group-hover:text-slate-900">
                                                    {item.kind === 'operation' ? 'Open →' : 'Configure →'}
                                                </span>
                                            </AdminCard>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
