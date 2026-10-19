import { Link } from '@inertiajs/react';
import { AdminBody, AdminCard, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function SupportIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Support">
            <AdminPage>
                <AdminHeader
                    eyebrow="Customer success"
                    title="Support dashboard"
                    description="Open cases, SLA health, escalations, and customer feedback."
                />
                <AdminBody className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminMetric label="Open tickets" value={metrics.open_tickets ?? 0} accent={!!metrics.overdue_sla} hint={metrics.overdue_sla ? `${metrics.overdue_sla} SLA overdue` : undefined} />
                        <AdminMetric label="Avg first response" value={metrics.avg_first_response_minutes != null ? `${metrics.avg_first_response_minutes}m` : '—'} />
                        <AdminMetric label="Open escalations" value={metrics.open_escalations ?? 0} />
                        <AdminMetric label="New feedback" value={metrics.new_feedback ?? 0} />
                    </div>

                    <AdminCard padding={true}>
                        <Link href="/admin/support/tickets" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            Go to ticket queue →
                        </Link>
                    </AdminCard>

                    {groups.map((group) => (
                        <section key={group.group}>
                            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.group}</h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((item) => {
                                    const href = item.href || (item.kind === 'operation' ? `/admin/support/operations/${item.id}` : `/admin/support/${item.id}`);
                                    return (
                                        <Link key={item.id} href={href} className="group block">
                                            <AdminCard className="h-full transition group-hover:ring-1 group-hover:ring-slate-900/10">
                                                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
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
