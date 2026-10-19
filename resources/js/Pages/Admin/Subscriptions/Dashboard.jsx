import { Link } from '@inertiajs/react';
import {
    AdminBadge,
    AdminBody,
    AdminCard,
    AdminHeader,
    AdminLinkButton,
    AdminMetric,
    AdminPage,
    badgeToneFor,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate, money } from '../../../lib/utils';

export default function SubscriptionDashboard({ summary = {}, plans = [], months = [], failedPayments = [], unconverted = [] }) {
    const sub = summary.subscriptions || {};
    const trials = summary.trials || {};
    const failed = summary.failedPayments || {};

    return (
        <AdminLayout title="Subscriptions">
            <AdminPage>
                <AdminHeader
                    eyebrow="Billing"
                    title="Subscription dashboard"
                    description="Active plans, trials, revenue, and payment health."
                    actions={
                        <>
                            <AdminLinkButton href="/admin/subscriptions/directory" variant="secondary">
                                Directory
                            </AdminLinkButton>
                            <AdminLinkButton href="/admin/plans" variant="accent">
                                Manage plans
                            </AdminLinkButton>
                        </>
                    }
                />
                <AdminBody className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminMetric label="Active subscriptions" value={sub.active ?? 0} />
                        <AdminMetric label="Recurring MRR (est.)" value={money(sub.recurring ?? 0)} />
                        <AdminMetric label="Trials active" value={trials.active ?? 0} hint={`${trials.endingSoon ?? 0} ending soon`} />
                        <AdminMetric label="Failed payments" value={failed.count ?? 0} hint={money(failed.amount ?? 0)} accent />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <AdminCard title="Plans in market">
                            <ul className="space-y-2 text-sm">
                                {plans.map((row) => (
                                    <li key={row.label} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                                        <span>{row.label}</span>
                                        <span className="text-slate-600">
                                            {row.count} · {money(row.monthly)}/mo
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </AdminCard>
                        <AdminCard title="Revenue trend (12 mo.)">
                            <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                                {months.map((m) => (
                                    <li key={m.label} className="flex justify-between">
                                        <span className="text-slate-500">{m.label}</span>
                                        <span className="font-medium">{money(m.revenue)}</span>
                                    </li>
                                ))}
                            </ul>
                        </AdminCard>
                    </div>

                    <AdminCard title="Recent failed plan payments">
                        <ul className="divide-y divide-slate-100 text-sm">
                            {failedPayments.slice(0, 8).map((p) => (
                                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                                    <span>{p.company}</span>
                                    <AdminBadge tone={badgeToneFor(p.status)}>{p.status}</AdminBadge>
                                    <span className="text-slate-600">{money(p.amount)}</span>
                                </li>
                            ))}
                            {failedPayments.length === 0 && <li className="py-4 text-slate-400">No failed payments.</li>}
                        </ul>
                        <Link href="/admin/billing/payments?status=failed" className="mt-3 inline-block text-sm font-medium text-slate-700 hover:underline">
                            View all payments →
                        </Link>
                    </AdminCard>

                    <AdminCard title="Expired trials (not converted)">
                        <ul className="text-sm">
                            {unconverted.map((c) => (
                                <li key={c.id} className="flex justify-between border-b border-slate-50 py-2 last:border-0">
                                    <Link href={`/admin/subscriptions/companies/${c.id}`} className="font-medium hover:underline">
                                        {c.name}
                                    </Link>
                                    <span className="text-slate-500">{formatDate(c.ended_at)}</span>
                                </li>
                            ))}
                        </ul>
                    </AdminCard>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
