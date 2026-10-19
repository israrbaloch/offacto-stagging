import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminFilterBar,
    AdminHeader,
    AdminPage,
    AdminTable,
    badgeToneFor,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import Pagination from '../../../Components/Pagination';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate, money } from '../../../lib/utils';

export default function BillingPayments({ payments, filters = {} }) {
    const [form, setForm] = useState({ q: filters.q || '', status: filters.status || '' });

    const search = (e) => {
        e.preventDefault();
        router.get('/admin/billing/payments', form, { preserveState: true });
    };

    return (
        <AdminLayout title="Payments">
            <AdminPage>
                <AdminHeader
                    eyebrow="Billing"
                    title="Payment reconciliation"
                    description="Subscription checkouts, renewals, failures, and provider references."
                />
                <AdminBody className="space-y-6">
                    <AdminFilterBar onSubmit={search}>
                        <input
                            className={`${inputClass} lg:col-span-2`}
                            value={form.q}
                            onChange={(e) => setForm({ ...form, q: e.target.value })}
                            placeholder="Company or Mollie ID"
                        />
                        <select className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                            <option value="">All statuses</option>
                            <option value="paid">paid</option>
                            <option value="pending">pending</option>
                            <option value="failed">failed</option>
                            <option value="canceled">canceled</option>
                        </select>
                        <div className="flex items-end lg:col-span-1">
                            <AdminButton type="submit">Apply filters</AdminButton>
                        </div>
                    </AdminFilterBar>

                    <AdminTable columns={['Company', 'Plan', 'Status', 'Amount', 'Paid', 'Provider']}>
                        {(payments?.data || []).map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3">
                                    <Link href={`/admin/subscriptions/companies/${row.company_id}`} className="font-medium text-slate-900 hover:underline">
                                        {row.company}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">{row.plan}</td>
                                <td className="px-4 py-3">
                                    <AdminBadge tone={badgeToneFor(row.status)}>{row.status}</AdminBadge>
                                </td>
                                <td className="px-4 py-3 text-sm tabular-nums">
                                    {money(row.amount)} {row.currency}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">{formatDate(row.paid_at || row.created_at)}</td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.mollie_payment_id || '—'}</td>
                            </tr>
                        ))}
                    </AdminTable>
                    <Pagination links={payments?.links || []} />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
