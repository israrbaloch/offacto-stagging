import { AdminBody, AdminCard, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { money } from '../../../lib/utils';

export default function BillingReports({ reports = {} }) {
    return (
        <AdminLayout title="Revenue reports">
            <AdminPage>
                <AdminHeader
                    eyebrow="Billing"
                    title="Revenue & tax summary"
                    description="Subscription cash collected (plan payments). Tenant invoice revenue is reported separately."
                />
                <AdminBody className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <AdminMetric label="Total collected" value={money(reports.collected_cash ?? 0)} />
                        <AdminMetric label="Collected this month" value={money(reports.collected_this_month ?? 0)} />
                        <AdminMetric label="Failed (open)" value={money(reports.failed_amount ?? 0)} hint={`${reports.failed_count ?? 0} payments`} accent={!!reports.failed_count} />
                        <AdminMetric label="Successful payments" value={reports.paid_count ?? 0} />
                        <AdminMetric label="Refunds recorded" value={money(reports.refunds ?? 0)} />
                    </div>
                    <AdminCard title="Reporting notes" description="Accounting distinctions for finance review.">
                        <p className="text-sm leading-relaxed text-slate-600">{reports.note}</p>
                        <p className="mt-2 text-xs text-slate-400">Tax breakdown and recognized vs. cash reporting can be extended when accounting rules are finalized.</p>
                    </AdminCard>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
