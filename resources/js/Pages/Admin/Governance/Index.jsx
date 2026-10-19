import AdminDomainHub from '../../../Components/Admin/AdminDomainHub';
import { AdminBody, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function GovernanceIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Governance">
            <AdminPage>
                <AdminHeader
                    eyebrow="Platform"
                    title="Governance & advanced operations"
                    description="Bulk actions, imports, exports, settings snapshots, and admin access reviews."
                />
                <AdminBody>
                    <AdminDomainHub
                        metricsSlot={
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <AdminMetric label="Environment" value={metrics.environment ?? '—'} accent={metrics.environment === 'production'} />
                                <AdminMetric label="Waiting for approval" value={metrics.pending_approvals ?? 0} accent={!!metrics.pending_approvals} />
                                <AdminMetric label="Scheduled changes" value={metrics.scheduled_changes ?? 0} />
                                <AdminMetric label="Exports in progress" value={metrics.open_exports ?? 0} />
                                <AdminMetric label="Bulk actions (draft)" value={metrics.draft_bulk ?? 0} />
                                <AdminMetric label="Data checks flagged" value={metrics.reconciliation_flags ?? 0} accent={!!metrics.reconciliation_flags} />
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
