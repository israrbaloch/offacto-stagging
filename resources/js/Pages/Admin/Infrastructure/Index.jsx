import AdminDomainHub from '../../../Components/Admin/AdminDomainHub';
import { AdminBody, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function InfrastructureIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Infrastructure">
            <AdminPage>
                <AdminHeader
                    eyebrow="Platform"
                    title="Infrastructure & reliability"
                    description="Database health, background jobs, backups, storage, and planned maintenance windows."
                />
                <AdminBody>
                    <AdminDomainHub
                        metricsSlot={
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <AdminMetric label="Database" value={metrics.db_ok ? 'Healthy' : 'Needs attention'} accent={!metrics.db_ok} />
                                <AdminMetric label="Jobs waiting" value={metrics.queue_pending ?? 0} accent={!!metrics.queue_pending} />
                                <AdminMetric label="Failed background jobs" value={metrics.queue_failed ?? 0} accent={!!metrics.queue_failed} />
                                <AdminMetric label="Data checks flagged" value={metrics.integrity_issues ?? 0} accent={!!metrics.integrity_issues} />
                                <AdminMetric label="Public file storage (MB)" value={metrics.storage_mb ?? 0} />
                                <AdminMetric label="Maintenance page" value={metrics.maintenance_on ? 'Visible to customers' : 'Off'} accent={!!metrics.maintenance_on} />
                            </div>
                        }
                        groups={groups}
                        resolveHref={(item) => item.href}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
