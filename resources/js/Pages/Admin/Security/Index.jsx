import AdminDomainHub from '../../../Components/Admin/AdminDomainHub';
import { AdminBody, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function SecurityIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Security">
            <AdminPage>
                <AdminHeader eyebrow="Platform" title="Security" description="Access policies, fraud review, incidents, and credential hygiene." />
                <AdminBody>
                    <AdminDomainHub
                        metricsSlot={
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <AdminMetric label="Failed sign-ins (24h)" value={metrics.failed_logins_24h ?? 0} accent={!!metrics.failed_logins_24h} />
                                <AdminMetric label="Fraud reviews open" value={metrics.open_fraud_reviews ?? 0} />
                                <AdminMetric label="Active account limits" value={metrics.active_restrictions ?? 0} />
                                <AdminMetric label="Security incidents open" value={metrics.open_incidents ?? 0} />
                                <AdminMetric label="Temporary policy exceptions" value={metrics.active_exceptions ?? 0} />
                                <AdminMetric label="Credential rotations overdue" value={metrics.rotation_overdue ?? 0} accent={!!metrics.rotation_overdue} />
                                <AdminMetric label="Companies awaiting approval" value={metrics.pending_company_approvals ?? 0} />
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
