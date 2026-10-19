import { router, useForm } from '@inertiajs/react';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminCard,
    AdminField,
    AdminHeader,
    AdminPage,
    AdminTable,
    AdminTextButton,
    badgeToneFor,
    checkboxClass,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

const textareaClass = `${inputClass} min-h-[80px]`;

export default function SupportOperation({
    section,
    operation,
    nav = [],
    requests = [],
    companies = [],
    companyId = null,
    timeline = [],
    recoveries = [],
    users = [],
    macros = [],
    articles = [],
    feedback = [],
    escalations = [],
    tickets = [],
}) {
    const accessForm = useForm({ company_id: '', reason: '', scope: 'read_only_context' });
    const recoveryForm = useForm({ user_id: '', verification_method: 'email_otp', notes: '' });
    const macroForm = useForm({ title: '', category: 'general', body: '', shortcut: '' });
    const articleForm = useForm({ slug: '', title: '', category: 'guide', body: '' });
    const feedbackForm = useForm({ feedback_type: 'feature_request', company_id: '', rating: '', body: '' });
    const escalationForm = useForm({ support_ticket_id: '', escalation_type: 'billing_dispute', assigned_team: 'billing', summary: '' });

    return (
        <AdminLayout title={section?.title}>
            <AdminPage>
                <AdminHeader eyebrow="Support" title={section?.title} description={section?.description} backHref="/admin/support" backLabel="Support hub" />
                <SettingsSectionNav nav={nav} activeId={operation} basePath="/admin/support" />
                <AdminBody className="space-y-6">
                    {operation === 'access-approvals' && (
                        <>
                            <AdminCard className="border-amber-100 bg-amber-50/40" padding={true}>
                                <p className="text-sm text-slate-700">Approval documents context review only. No impersonation, hidden login, or password reset without identity verification.</p>
                            </AdminCard>
                            <AdminCard title="Request access">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        accessForm.post('/admin/support/access-requests');
                                    }}
                                >
                                    <AdminField label="Company">
                                        <select className={selectClass} value={accessForm.data.company_id} onChange={(e) => accessForm.setData('company_id', e.target.value)}>
                                            <option value="">Select…</option>
                                            {companies.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.company_name}
                                                </option>
                                            ))}
                                        </select>
                                    </AdminField>
                                    <AdminField label="Scope">
                                        <select className={selectClass} value={accessForm.data.scope} onChange={(e) => accessForm.setData('scope', e.target.value)}>
                                            <option value="read_only_context">Read-only context</option>
                                            <option value="billing_review">Billing review</option>
                                            <option value="technical_diagnostics">Technical diagnostics</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Reason">
                                        <textarea className={textareaClass} value={accessForm.data.reason} onChange={(e) => accessForm.setData('reason', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Submit request</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Company', 'Scope', 'Status', '']}>
                                {requests.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.company?.company_name}</td>
                                        <td className="px-4 py-3 text-sm">{row.scope}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={badgeToneFor(row.status)}>{row.status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.status === 'pending' && (
                                                <AdminTextButton
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(`/admin/support/access-requests/${row.id}/approve`, {
                                                            confirm: true,
                                                            no_impersonation_ack: true,
                                                        })
                                                    }
                                                >
                                                    Approve
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'activity-timeline' && (
                        <>
                            <form
                                className="flex max-w-md gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const select = e.target.elements.company_id;
                                    router.get('/admin/support/operations/activity-timeline', { company_id: select.value });
                                }}
                            >
                                <select name="company_id" className={selectClass} defaultValue={companyId || ''}>
                                    <option value="">Select company…</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.company_name}
                                        </option>
                                    ))}
                                </select>
                                <AdminButton type="submit">Load</AdminButton>
                            </form>
                            <AdminTable columns={['When', 'Type', 'Event', 'Detail']}>
                                {timeline.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.at)}</td>
                                        <td className="px-4 py-3 text-sm">{row.type}</td>
                                        <td className="px-4 py-3 text-sm">{row.label}</td>
                                        <td className="px-4 py-3 text-xs text-slate-600">{row.detail || '—'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'account-recovery' && (
                        <>
                            <AdminCard title="Recovery intake">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        recoveryForm.post('/admin/support/recovery-requests');
                                    }}
                                >
                                    <AdminField label="User">
                                        <select className={selectClass} value={recoveryForm.data.user_id} onChange={(e) => recoveryForm.setData('user_id', e.target.value)}>
                                            <option value="">Select…</option>
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name} ({u.email})
                                                </option>
                                            ))}
                                        </select>
                                    </AdminField>
                                    <AdminField label="Verification">
                                        <select className={selectClass} value={recoveryForm.data.verification_method} onChange={(e) => recoveryForm.setData('verification_method', e.target.value)}>
                                            <option value="email_otp">Email OTP</option>
                                            <option value="id_check">ID check (manual)</option>
                                            <option value="billing_proof">Billing proof</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Notes" className="sm:col-span-2">
                                        <textarea className={textareaClass} value={recoveryForm.data.notes} onChange={(e) => recoveryForm.setData('notes', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Open case</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'User', 'Status', 'Method', '']}>
                                {recoveries.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.user?.email}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{row.verification_method}</td>
                                        <td className="px-4 py-3">
                                            <AdminTextButton type="button" onClick={() => router.patch(`/admin/support/recovery-requests/${row.id}`, { status: 'guidance_sent' })}>
                                                Mark guidance sent
                                            </AdminTextButton>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'macros-knowledge' && (
                        <>
                            <AdminCard title="New macro">
                                <form
                                    className="space-y-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        macroForm.post('/admin/support/macros');
                                    }}
                                >
                                    <AdminField label="Title">
                                        <input className={inputClass} value={macroForm.data.title} onChange={(e) => macroForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Body">
                                        <textarea className={textareaClass} value={macroForm.data.body} onChange={(e) => macroForm.setData('body', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Save macro</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Title', 'Category', 'Shortcut']}>
                                {macros.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm font-medium">{row.title}</td>
                                        <td className="px-4 py-3 text-sm">{row.category}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.shortcut || '—'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                            <AdminCard title="New knowledge article">
                                <form
                                    className="space-y-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        articleForm.post('/admin/support/articles');
                                    }}
                                >
                                    <AdminField label="Slug">
                                        <input className={inputClass} value={articleForm.data.slug} onChange={(e) => articleForm.setData('slug', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Title">
                                        <input className={inputClass} value={articleForm.data.title} onChange={(e) => articleForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Body">
                                        <textarea className={textareaClass} value={articleForm.data.body} onChange={(e) => articleForm.setData('body', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Publish article</AdminButton>
                                </form>
                            </AdminCard>
                        </>
                    )}

                    {operation === 'feedback' && (
                        <>
                            <AdminTable columns={['Type', 'Rating', 'Company', 'Status', 'Body']}>
                                {feedback.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{row.feedback_type}</td>
                                        <td className="px-4 py-3 text-sm">{row.rating ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm">{row.company?.company_name || '—'}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.body?.slice(0, 80)}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'escalations' && (
                        <>
                            <AdminCard title="Create escalation">
                                <form
                                    className="space-y-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        escalationForm.post('/admin/support/escalations');
                                    }}
                                >
                                    <AdminField label="Ticket (optional)">
                                        <select className={selectClass} value={escalationForm.data.support_ticket_id} onChange={(e) => escalationForm.setData('support_ticket_id', e.target.value)}>
                                            <option value="">—</option>
                                            {tickets.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.reference} — {t.subject}
                                                </option>
                                            ))}
                                        </select>
                                    </AdminField>
                                    <AdminField label="Type">
                                        <select className={selectClass} value={escalationForm.data.escalation_type} onChange={(e) => escalationForm.setData('escalation_type', e.target.value)}>
                                            <option value="billing_dispute">Billing dispute</option>
                                            <option value="fraud">Suspected fraud</option>
                                            <option value="privacy">Privacy</option>
                                            <option value="legal">Legal</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Summary">
                                        <textarea className={textareaClass} value={escalationForm.data.summary} onChange={(e) => escalationForm.setData('summary', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Escalate</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Type', 'Team', 'Status', 'Ticket', 'Summary']}>
                                {escalations.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{row.escalation_type}</td>
                                        <td className="px-4 py-3 text-sm">{row.assigned_team}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.ticket?.reference || '—'}</td>
                                        <td className="px-4 py-3 text-sm">{row.summary}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
