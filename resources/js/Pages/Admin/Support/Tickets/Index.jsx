import { Link, useForm } from '@inertiajs/react';
import { AdminBadge, AdminBody, AdminButton, AdminCard, AdminField, AdminHeader, AdminPage, AdminTable, badgeToneFor, inputClass, selectClass } from '../../../../Components/Admin/ui';
import AdminLayout from '../../../../Layouts/AdminLayout';
import { formatDate } from '../../../../lib/utils';

export default function SupportTicketsIndex({ tickets = [], admins = [], companies = [] }) {
    const form = useForm({
        subject: '',
        description: '',
        priority: 'normal',
        category: 'general',
        company_id: '',
        assigned_to_user_id: '',
    });

    return (
        <AdminLayout title="Support tickets">
            <AdminPage>
                <AdminHeader title="Support tickets" description="Create and manage customer support cases." backHref="/admin/support" backLabel="Support hub" />
                <AdminBody className="space-y-6">
                    <AdminCard title="New ticket">
                        <form
                            className="grid gap-3 sm:grid-cols-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.post('/admin/support/tickets');
                            }}
                        >
                            <AdminField label="Subject" className="sm:col-span-2">
                                <input className={inputClass} value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} />
                            </AdminField>
                            <AdminField label="Description" className="sm:col-span-2">
                                <textarea className={`${inputClass} min-h-[80px]`} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                            </AdminField>
                            <AdminField label="Priority">
                                <select className={selectClass} value={form.data.priority} onChange={(e) => form.setData('priority', e.target.value)}>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="normal">Normal</option>
                                    <option value="low">Low</option>
                                </select>
                            </AdminField>
                            <AdminField label="Category">
                                <input className={inputClass} value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} />
                            </AdminField>
                            <AdminField label="Company">
                                <select className={selectClass} value={form.data.company_id} onChange={(e) => form.setData('company_id', e.target.value)}>
                                    <option value="">—</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.company_name}
                                        </option>
                                    ))}
                                </select>
                            </AdminField>
                            <AdminField label="Assign to">
                                <select className={selectClass} value={form.data.assigned_to_user_id} onChange={(e) => form.setData('assigned_to_user_id', e.target.value)}>
                                    <option value="">Unassigned</option>
                                    {admins.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name}
                                        </option>
                                    ))}
                                </select>
                            </AdminField>
                            <AdminButton type="submit" disabled={form.processing}>
                                Create ticket
                            </AdminButton>
                        </form>
                    </AdminCard>

                    <AdminTable columns={['Reference', 'Subject', 'Status', 'Priority', 'Company', 'SLA due', '']}>
                        {tickets.map((row) => (
                            <tr key={row.id}>
                                <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                <td className="px-4 py-3 text-sm font-medium">{row.subject}</td>
                                <td className="px-4 py-3">
                                    <AdminBadge tone={badgeToneFor(row.status)}>{row.status}</AdminBadge>
                                </td>
                                <td className="px-4 py-3 text-sm">{row.priority}</td>
                                <td className="px-4 py-3 text-sm">{row.company || '—'}</td>
                                <td className="px-4 py-3 text-sm">{formatDate(row.sla_due_at)}</td>
                                <td className="px-4 py-3">
                                    <Link href={`/admin/support/tickets/${row.id}`} className="text-sm font-medium text-indigo-600">
                                        Open
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </AdminTable>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
