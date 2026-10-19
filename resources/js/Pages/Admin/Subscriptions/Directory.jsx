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
import { formatDate } from '../../../lib/utils';

export default function SubscriptionDirectory({ subscriptions, filters = {}, plans = [] }) {
    const [form, setForm] = useState({ ...filters });

    const apply = (e) => {
        e.preventDefault();
        router.get('/admin/subscriptions/directory', form, { preserveState: true });
    };

    return (
        <AdminLayout title="Subscription directory">
            <AdminPage>
                <AdminHeader
                    eyebrow="Billing"
                    title="Subscription directory"
                    description="Search by company, plan, lifecycle state, or payment status."
                    backHref="/admin/subscriptions"
                    backLabel="Dashboard"
                />
                <AdminBody className="space-y-6">
                    <AdminFilterBar onSubmit={apply}>
                        <input className={`${inputClass} lg:col-span-2`} placeholder="Company or email" value={form.q || ''} onChange={(e) => setForm({ ...form, q: e.target.value })} />
                        <select className={selectClass} value={form.plan || ''} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                            <option value="">All plans</option>
                            {plans.map((slug) => (
                                <option key={slug} value={slug}>
                                    {slug}
                                </option>
                            ))}
                        </select>
                        <select className={selectClass} value={form.state || 'all'} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                            <option value="all">All states</option>
                            <option value="trial">Trial</option>
                            <option value="active">Active</option>
                            <option value="canceling">Canceling</option>
                            <option value="expired">Expired</option>
                            <option value="trial_expired">Trial expired</option>
                        </select>
                        <select className={selectClass} value={form.payment_status || ''} onChange={(e) => setForm({ ...form, payment_status: e.target.value })}>
                            <option value="">Any payment</option>
                            <option value="paid">paid</option>
                            <option value="pending">pending</option>
                            <option value="failed">failed</option>
                        </select>
                        <div className="lg:col-span-4">
                            <AdminButton type="submit">Apply</AdminButton>
                        </div>
                    </AdminFilterBar>

                    <AdminTable columns={['Company', 'Plan', 'State', 'Renewal / trial end', '']}>
                        {(subscriptions?.data || []).map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3">
                                    <div className="font-medium">{row.company_name}</div>
                                    <div className="text-xs text-slate-500">{row.owner}</div>
                                </td>
                                <td className="px-4 py-3 text-sm">{row.plan || '—'}</td>
                                <td className="px-4 py-3">
                                    <AdminBadge tone={badgeToneFor(row.state)}>{row.state.replace('_', ' ')}</AdminBadge>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                    {formatDate(row.renewal_at || row.trial_ends_at)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/admin/subscriptions/companies/${row.id}`} className="text-sm font-medium hover:underline">
                                        Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </AdminTable>
                    <Pagination links={subscriptions?.links || []} />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
