import { useForm } from '@inertiajs/react';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminCard,
    AdminDl,
    AdminDlRow,
    AdminField,
    AdminFormActions,
    AdminFormGrid,
    AdminHeader,
    AdminLinkButton,
    AdminPage,
    AdminTable,
    badgeToneFor,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate, money } from '../../../lib/utils';

export default function SubscriptionShow({ company, subscription = {}, trial = {}, payments = [], adjustments = [], plans = [] }) {
    const form = useForm({
        action: 'extend_period',
        days: 30,
        plan: plans[0]?.slug || '',
        reason: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(`/admin/subscriptions/companies/${company.id}/adjust`, { preserveScroll: true });
    };

    return (
        <AdminLayout title={company.name}>
            <AdminPage>
                <AdminHeader
                    eyebrow="Billing"
                    title={company.name}
                    description={`${company.email} · Owner ${company.owner || '—'}`}
                    backHref="/admin/subscriptions/directory"
                    backLabel="Directory"
                    actions={<AdminLinkButton href={`/admin/companies/${company.id}`} variant="secondary">Company profile</AdminLinkButton>}
                />
                <AdminBody className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <AdminCard title="Subscription">
                            <AdminDl>
                                <AdminDlRow term="Plan">{subscription.plan_label || subscription.plan || 'None'}</AdminDlRow>
                                <AdminDlRow term="Valid">{subscription.valid ? 'Yes' : 'No'}</AdminDlRow>
                                <AdminDlRow term="Period ends">{formatDate(subscription.ends_at)}</AdminDlRow>
                                <AdminDlRow term="Cancel at period end">{subscription.cancel_at_period_end ? 'Yes' : 'No'}</AdminDlRow>
                            </AdminDl>
                        </AdminCard>
                        <AdminCard title="Trial">
                            <AdminDl>
                                <AdminDlRow term="Trial ends">{formatDate(trial.ends_at)}</AdminDlRow>
                                <AdminDlRow term="Days left">{trial.days_left ?? '—'}</AdminDlRow>
                                <AdminDlRow term="Expired">{trial.expired ? 'Yes' : 'No'}</AdminDlRow>
                            </AdminDl>
                        </AdminCard>
                    </div>

                    <AdminCard title="Authorized adjustments" description="Changes are logged for audit. Include a reason when required.">
                        <form onSubmit={submit}>
                            <AdminFormGrid cols={4}>
                                <AdminField label="Action">
                                    <select className={selectClass} value={form.data.action} onChange={(e) => form.setData('action', e.target.value)}>
                                        <option value="extend_period">Extend period</option>
                                        <option value="complimentary_period">Complimentary period</option>
                                        <option value="change_plan">Change plan</option>
                                        <option value="cancel_at_period_end">Cancel at period end</option>
                                    </select>
                                </AdminField>
                                <AdminField label="Days">
                                    <input type="number" min={1} className={inputClass} value={form.data.days} onChange={(e) => form.setData('days', Number(e.target.value))} />
                                </AdminField>
                                <AdminField label="Target plan">
                                    <select className={selectClass} value={form.data.plan} onChange={(e) => form.setData('plan', e.target.value)}>
                                        {plans.map((p) => (
                                            <option key={p.slug} value={p.slug}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </AdminField>
                                <AdminField label="Audit reason" className="sm:col-span-2 lg:col-span-4">
                                    <input className={inputClass} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} placeholder="Why this adjustment is authorized" />
                                </AdminField>
                            </AdminFormGrid>
                            <AdminFormActions className="mt-4">
                                <AdminButton type="submit" disabled={form.processing}>
                                    Apply adjustment
                                </AdminButton>
                            </AdminFormActions>
                        </form>
                        {adjustments.length > 0 && (
                            <ul className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100">
                                {adjustments.map((a) => (
                                    <li key={a.id} className="px-4 py-3 text-sm">
                                        <span className="font-medium text-slate-900">{a.action}</span>
                                        <span className="text-slate-400"> · </span>
                                        <span className="text-slate-600">{a.admin}</span>
                                        <span className="text-slate-400"> · </span>
                                        <span className="text-slate-500">{formatDate(a.created_at)}</span>
                                        {a.reason && <p className="mt-1 text-slate-500">{a.reason}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </AdminCard>

                    <AdminCard title="Payment history" padding={false}>
                        <AdminTable columns={['Date', 'Status', 'Amount', 'Plan', 'Provider ID']}>
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/80">
                                    <td className="px-4 py-3 text-sm">{formatDate(p.paid_at || p.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <AdminBadge tone={badgeToneFor(p.status)}>{p.status}</AdminBadge>
                                    </td>
                                    <td className="px-4 py-3 text-sm tabular-nums">
                                        {money(p.amount)} {p.currency}
                                    </td>
                                    <td className="px-4 py-3 text-sm">{p.plan}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.mollie_payment_id || '—'}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    </AdminCard>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
