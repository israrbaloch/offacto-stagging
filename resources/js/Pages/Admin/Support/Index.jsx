import { Link } from '@inertiajs/react';
import AdminDomainHub from '../../../Components/Admin/AdminDomainHub';
import { AdminBody, AdminCard, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function SupportIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Support">
            <AdminPage>
                <AdminHeader
                    eyebrow="Customer success"
                    title="Support"
                    description="Tickets, response times, escalations, and customer feedback."
                />
                <AdminBody>
                    <AdminDomainHub
                        metricsSlot={
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <AdminMetric label="Open tickets" value={metrics.open_tickets ?? 0} accent={!!metrics.overdue_sla} hint={metrics.overdue_sla ? `${metrics.overdue_sla} past SLA` : undefined} />
                                <AdminMetric label="Average first response" value={metrics.avg_first_response_minutes != null ? `${metrics.avg_first_response_minutes} min` : '—'} />
                                <AdminMetric label="Open escalations" value={metrics.open_escalations ?? 0} />
                                <AdminMetric label="New feedback" value={metrics.new_feedback ?? 0} />
                            </div>
                        }
                        banner={
                            <AdminCard padding={true}>
                                <Link href="/admin/support/tickets" className="text-sm font-medium text-slate-900 underline">
                                    Open ticket queue →
                                </Link>
                            </AdminCard>
                        }
                        groups={groups}
                        resolveHref={(item) => item.href || (item.kind === 'operation' ? `/admin/support/operations/${item.id}` : `/admin/support/${item.id}`)}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
