import AdminDomainHub from '../../../Components/Admin/AdminDomainHub';
import { AdminBody, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function CommunicationsIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Email & notifications">
            <AdminPage>
                <AdminHeader
                    eyebrow="Platform"
                    title="Email & notifications"
                    description="Templates, delivery monitoring, and communication rules for customers and staff."
                />
                <AdminBody>
                    <AdminDomainHub
                        metricsSlot={
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <AdminMetric label="Sent (30 days)" value={metrics.deliveries_30d ?? 0} />
                                <AdminMetric label="Failed or bounced (30 days)" value={metrics.failed_30d ?? 0} accent={!!metrics.failed_30d} />
                                <AdminMetric label="Waiting to send" value={metrics.queue_pending ?? 0} accent={!!metrics.queue_pending} />
                                <AdminMetric label="Send errors in queue" value={metrics.queue_failed ?? 0} accent={!!metrics.queue_failed} />
                                <AdminMetric label="Blocked addresses" value={metrics.suppressions ?? 0} />
                                <AdminMetric label="Active notification rules" value={metrics.rules_enabled ?? 0} />
                                <AdminMetric label="Test emails (30 days)" value={metrics.tests_30d ?? 0} />
                                <AdminMetric label="Scheduled reminders" value={metrics.scheduled_enabled ? 'On' : 'Off'} />
                            </div>
                        }
                        groups={groups}
                        resolveHref={(item) =>
                            item.kind === 'operation'
                                ? `/admin/communications/operations/${item.id}`
                                : `/admin/communications/${item.id}`
                        }
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
