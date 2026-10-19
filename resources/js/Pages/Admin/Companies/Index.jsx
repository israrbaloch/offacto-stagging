import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminFilterBar,
    AdminHeader,
    AdminLinkButton,
    AdminPage,
    AdminTable,
    badgeToneFor,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import Pagination from '../../../Components/Pagination';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

export default function AdminCompaniesIndex({ companies, filters = {}, approvalStatuses = [], languages = [] }) {
    const [form, setForm] = useState({ ...filters });

    const apply = (event) => {
        event.preventDefault();
        router.get('/admin/companies', form, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Companies">
            <AdminPage>
                <AdminHeader
                    eyebrow="Directory"
                    title="Companies"
                    description="Search and filter every registered company."
                    actions={<AdminLinkButton href="/admin/companies/approvals" variant="accent">Pending approvals</AdminLinkButton>}
                />
                <AdminBody className="space-y-6">
                    <AdminFilterBar onSubmit={apply}>
                        <input
                            value={form.q || ''}
                            onChange={(e) => setForm({ ...form, q: e.target.value })}
                            placeholder="Name, email, VAT…"
                            className={`${inputClass} lg:col-span-2`}
                        />
                        <select value={form.approval || ''} onChange={(e) => setForm({ ...form, approval: e.target.value })} className={selectClass}>
                            <option value="">All approval states</option>
                            {approvalStatuses.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                        <select value={form.active || 'all'} onChange={(e) => setForm({ ...form, active: e.target.value })} className={selectClass}>
                            <option value="all">Any status</option>
                            <option value="yes">Active</option>
                            <option value="no">Inactive</option>
                        </select>
                        <select
                            value={form.subscription || 'all'}
                            onChange={(e) => setForm({ ...form, subscription: e.target.value })}
                            className={selectClass}
                        >
                            <option value="all">Any subscription</option>
                            <option value="trial">Trial</option>
                            <option value="subscribed">Subscribed</option>
                            <option value="expired">Expired</option>
                            <option value="none">None</option>
                        </select>
                        <select value={form.language || ''} onChange={(e) => setForm({ ...form, language: e.target.value })} className={selectClass}>
                            <option value="">Any language</option>
                            {languages.map((lang) => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                        <input
                            value={form.country || ''}
                            onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })}
                            placeholder="Country ISO"
                            maxLength={2}
                            className={`${inputClass} uppercase`}
                        />
                        <input type="date" value={form.registered_from || ''} onChange={(e) => setForm({ ...form, registered_from: e.target.value })} className={inputClass} />
                        <input type="date" value={form.registered_to || ''} onChange={(e) => setForm({ ...form, registered_to: e.target.value })} className={inputClass} />
                        <div className="flex items-end lg:col-span-4">
                            <AdminButton type="submit">Apply filters</AdminButton>
                        </div>
                    </AdminFilterBar>

                    <AdminTable columns={['Company', 'Owner', 'Approval', 'Plan', 'Country', 'Registered', '']}>
                        {(companies?.data || []).map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900">{row.company_name}</div>
                                    <div className="text-xs text-slate-500">{row.email}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{row.owner || '—'}</td>
                                <td className="px-4 py-3">
                                    <AdminBadge tone={badgeToneFor(row.approval_status)}>{row.approval_status || '—'}</AdminBadge>
                                    {!row.is_active && (
                                        <span className="ml-1">
                                            <AdminBadge tone="danger">inactive</AdminBadge>
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-600">{row.subscription_plan || '—'}</td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.country}</td>
                                <td className="px-4 py-3 tabular-nums text-slate-600">{formatDate(row.created_at)}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/admin/companies/${row.id}`} className="text-sm font-medium text-slate-900 hover:underline">
                                        Open
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </AdminTable>
                    <Pagination links={companies?.links || []} />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
