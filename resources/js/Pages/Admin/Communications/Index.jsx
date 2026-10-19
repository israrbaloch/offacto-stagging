import { Link } from '@inertiajs/react';
import { AdminBody, AdminCard, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function CommunicationsIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Email & notifications">
            <AdminPage>
                <AdminHeader
                    eyebrow="Platform"
                    title="Email & notifications"
                    description="Templates, rules, delivery monitoring, and customer communication metadata."
                />
                <AdminBody className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminMetric label="Deliveries (30d)" value={metrics.deliveries_30d ?? 0} />
                        <AdminMetric label="Failed / bounced (30d)" value={metrics.failed_30d ?? 0} accent={!!metrics.failed_30d} />
                        <AdminMetric label="Queue pending" value={metrics.queue_pending ?? 0} accent={!!metrics.queue_pending} />
                        <AdminMetric label="Failed jobs" value={metrics.queue_failed ?? 0} accent={!!metrics.queue_failed} />
                        <AdminMetric label="Suppressions" value={metrics.suppressions ?? 0} />
                        <AdminMetric label="Active rules" value={metrics.rules_enabled ?? 0} />
                        <AdminMetric label="Test sends (30d)" value={metrics.tests_30d ?? 0} />
                        <AdminMetric label="Scheduled jobs" value={metrics.scheduled_enabled ? 'On' : 'Off'} />
                    </div>

                    {groups.map((group) => (
                        <section key={group.group}>
                            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.group}</h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((item) => {
                                    const href =
                                        item.kind === 'operation'
                                            ? `/admin/communications/operations/${item.id}`
                                            : `/admin/communications/${item.id}`;
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
