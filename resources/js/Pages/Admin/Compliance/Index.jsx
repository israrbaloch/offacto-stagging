import AdminDomainHub from '../../../Components/Admin/AdminDomainHub';
import { AdminBody, AdminCard, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function ComplianceIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Compliance">
            <AdminPage>
                <AdminHeader
                    eyebrow="Legal & privacy"
                    title="Compliance"
                    description="Privacy requests, retention, incidents, and lawful authority workflows — always with manual review."
                />
                <AdminBody>
                    <AdminDomainHub
                        metricsSlot={
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <AdminMetric label="Open privacy requests" value={metrics.open_dsar ?? 0} accent={!!metrics.overdue_dsar} hint={metrics.overdue_dsar ? `${metrics.overdue_dsar} overdue` : undefined} />
                                <AdminMetric label="Authority requests pending" value={metrics.pending_authority ?? 0} hint={metrics.emergency_authority ? `${metrics.emergency_authority} urgent` : undefined} />
                                <AdminMetric label="Active legal holds" value={metrics.active_holds ?? 0} />
                                <AdminMetric label="Open breach incidents" value={metrics.open_breaches ?? 0} />
                                <AdminMetric label="Deletion jobs pending" value={metrics.pending_deletion ?? 0} />
                                <AdminMetric label="Restricted cases open" value={metrics.open_cases ?? 0} />
                                <AdminMetric label="Retention reviews due" value={metrics.retention_review_due ?? 0} />
                            </div>
                        }
                        banner={
                            <AdminCard className="border-amber-100 bg-amber-50/50" padding={true}>
                                <p className="text-sm leading-relaxed text-slate-700">
                                    <strong className="font-medium text-slate-900">Lawful requests only.</strong> Register authority requests, verify jurisdiction and legal basis, and record disclosures manually. An incoming request is not automatic permission to disclose all data.
                                </p>
                            </AdminCard>
                        }
                        groups={groups}
                        resolveHref={(item) =>
                            item.kind === 'operation' ? `/admin/compliance/operations/${item.id}` : `/admin/compliance/${item.id}`
                        }
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
