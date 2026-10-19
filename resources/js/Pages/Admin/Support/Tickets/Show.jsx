import { Link, useForm } from '@inertiajs/react';
import { AdminBadge, AdminBody, AdminButton, AdminCard, AdminField, AdminHeader, AdminPage, AdminTable, badgeToneFor, inputClass, selectClass } from '../../../../Components/Admin/ui';
import AdminLayout from '../../../../Layouts/AdminLayout';
import { formatDate } from '../../../../lib/utils';

const textareaClass = (base) => `${base} min-h-[100px]`;

export default function SupportTicketShow({ ticket, messages = [], timeline = [], admins = [], macros = [] }) {
    const replyForm = useForm({ body: '', is_internal: false });
    const updateForm = useForm({
        status: ticket.status,
        priority: ticket.priority,
        assigned_to_user_id: ticket.assignee?.id || '',
    });

    const insertMacro = (body) => {
        replyForm.setData('body', (replyForm.data.body ? replyForm.data.body + '\n\n' : '') + body);
    };

    return (
        <AdminLayout title={ticket.reference}>
            <AdminPage>
                <AdminHeader
                    title={ticket.subject}
                    description={`${ticket.reference} · ${ticket.category}`}
                    backHref="/admin/support/tickets"
                    backLabel="Tickets"
                />
                <AdminBody className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <AdminCard title="Conversation">
                            <div className="mb-4 space-y-3">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`rounded-xl border p-3 text-sm ${msg.is_internal ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200'}`}>
                                        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                            <span>{msg.author}{msg.is_internal ? ' · internal' : ''}</span>
                                            <span>{formatDate(msg.created_at)}</span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-slate-800">{msg.body}</p>
                                    </div>
                                ))}
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    replyForm.post(`/admin/support/tickets/${ticket.id}/messages`);
                                }}
                            >
                                <AdminField label="Reply">
                                    <textarea className={textareaClass(inputClass)} value={replyForm.data.body} onChange={(e) => replyForm.setData('body', e.target.value)} />
                                </AdminField>
                                <label className="mb-3 flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={replyForm.data.is_internal} onChange={(e) => replyForm.setData('is_internal', e.target.checked)} />
                                    Internal note only
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <AdminButton type="submit" disabled={replyForm.processing}>
                                        Add message
                                    </AdminButton>
                                    {macros.slice(0, 3).map((m) => (
                                        <button key={m.id} type="button" className="text-xs text-indigo-600" onClick={() => insertMacro(m.body)}>
                                            {m.title}
                                        </button>
                                    ))}
                                </div>
                            </form>
                        </AdminCard>
                    </div>

                    <div className="space-y-6">
                        <AdminCard title="Ticket">
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-slate-500">Status</dt>
                                    <dd>
                                        <AdminBadge tone={badgeToneFor(ticket.status)}>{ticket.status}</AdminBadge>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">SLA due</dt>
                                    <dd>{formatDate(ticket.sla_due_at)}</dd>
                                </div>
                                {ticket.company && (
                                    <div>
                                        <dt className="text-slate-500">Company</dt>
                                        <dd>
                                            <Link href={`/admin/companies/${ticket.company.id}`} className="text-indigo-600">
                                                {ticket.company.company_name}
                                            </Link>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                            <form
                                className="mt-4 space-y-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    updateForm.patch(`/admin/support/tickets/${ticket.id}`);
                                }}
                            >
                                <AdminField label="Status">
                                    <select className={selectClass} value={updateForm.data.status} onChange={(e) => updateForm.setData('status', e.target.value)}>
                                        <option value="open">Open</option>
                                        <option value="pending">Pending</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </AdminField>
                                <AdminField label="Assignee">
                                    <select className={selectClass} value={updateForm.data.assigned_to_user_id} onChange={(e) => updateForm.setData('assigned_to_user_id', e.target.value)}>
                                        <option value="">—</option>
                                        {admins.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>
                                </AdminField>
                                <AdminButton type="submit" variant="secondary">
                                    Update
                                </AdminButton>
                            </form>
                        </AdminCard>

                        {timeline.length > 0 && (
                            <AdminCard title="Customer timeline">
                                <ul className="space-y-2 text-xs text-slate-600">
                                    {timeline.map((ev) => (
                                        <li key={ev.id}>
                                            <span className="font-medium text-slate-800">{ev.label}</span> · {formatDate(ev.at)}
                                        </li>
                                    ))}
                                </ul>
                            </AdminCard>
                        )}
                    </div>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
