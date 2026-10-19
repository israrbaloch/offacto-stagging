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
import Pagination from '../../../Components/Pagination';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

const textareaClass = `${inputClass} min-h-[80px]`;

export default function SecurityOperation({
    section,
    operation,
    nav = [],
    signals = [],
    restrictions = [],
    users = [],
    companies = [],
    reviews = [],
    suggestions = [],
    tasks = [],
    apiKeysDue = 0,
    events,
    privilegedSample = [],
    filters = {},
    vuln = {},
    incidents = [],
    exceptions = [],
}) {
    const restrictionForm = useForm({
        user_id: '',
        company_id: '',
        restriction_type: 'review',
        reason: '',
        expires_at: '',
        confirm: false,
    });
    const incidentForm = useForm({ severity: 'medium', summary: '', containment_actions: '' });
    const exceptionForm = useForm({ policy_key: '', reason: '', expires_at: '', confirm: false });

    return (
        <AdminLayout title={section?.title}>
            <AdminPage>
                <AdminHeader eyebrow="Security" title={section?.title} description={section?.description} backHref="/admin/security" backLabel="Security hub" />
                <SettingsSectionNav nav={nav} activeId={operation} basePath="/admin/security" />
                <AdminBody className="space-y-6">
                    {operation === 'suspicious-activity' && (
                        <AdminTable columns={['When', 'Severity', 'Signal', 'Detail']}>
                            {signals.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 text-sm">{formatDate(row.at)}</td>
                                    <td className="px-4 py-3">
                                        <AdminBadge tone={row.severity === 'high' ? 'danger' : 'warning'}>{row.severity}</AdminBadge>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">{row.signal}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{row.detail}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'account-risk' && (
                        <>
                            <AdminCard title="Apply restriction">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        restrictionForm.post('/admin/security/restrictions');
                                    }}
                                >
                                    <AdminField label="User">
                                        <select className={selectClass} value={restrictionForm.data.user_id} onChange={(e) => restrictionForm.setData('user_id', e.target.value)}>
                                            <option value="">—</option>
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.email}
                                                </option>
                                            ))}
                                        </select>
                                    </AdminField>
                                    <AdminField label="Company">
                                        <select className={selectClass} value={restrictionForm.data.company_id} onChange={(e) => restrictionForm.setData('company_id', e.target.value)}>
                                            <option value="">—</option>
                                            {companies.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.company_name}
                                                </option>
                                            ))}
                                        </select>
                                    </AdminField>
                                    <AdminField label="Type">
                                        <select className={selectClass} value={restrictionForm.data.restriction_type} onChange={(e) => restrictionForm.setData('restriction_type', e.target.value)}>
                                            <option value="review">Under review</option>
                                            <option value="limited">Limited access</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Expires">
                                        <input type="date" className={inputClass} value={restrictionForm.data.expires_at} onChange={(e) => restrictionForm.setData('expires_at', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Reason" className="sm:col-span-2">
                                        <textarea className={textareaClass} value={restrictionForm.data.reason} onChange={(e) => restrictionForm.setData('reason', e.target.value)} />
                                    </AdminField>
                                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                        <input type="checkbox" className={checkboxClass} checked={restrictionForm.data.confirm} onChange={(e) => restrictionForm.setData('confirm', e.target.checked)} />
                                        I am authorized to apply this restriction under documented policy.
                                    </label>
                                    <AdminButton type="submit" disabled={!restrictionForm.data.confirm}>
                                        Apply
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Type', 'User/Company', 'Status', 'Expires']}>
                                {restrictions.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.restriction_type}</td>
                                        <td className="px-4 py-3 text-sm">{row.user?.email || row.company?.company_name || '—'}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.expires_at)}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'fraud-queue' && (
                        <>
                            {suggestions.length > 0 && (
                                <AdminCard title="Suggested reviews">
                                    <ul className="space-y-2 text-sm">
                                        {suggestions.map((s, i) => (
                                            <li key={i} className="flex justify-between gap-2">
                                                <span>
                                                    {s.type}: {s.subject} — {s.detail}
                                                </span>
                                                <AdminTextButton
                                                    type="button"
                                                    onClick={() =>
                                                        router.post('/admin/security/fraud-reviews', {
                                                            review_type: s.type,
                                                            summary: `${s.subject}: ${s.detail}`,
                                                            subject_type: s.subject_type || '',
                                                            subject_id: s.subject_id || '',
                                                        })
                                                    }
                                                >
                                                    Open review
                                                </AdminTextButton>
                                            </li>
                                        ))}
                                    </ul>
                                </AdminCard>
                            )}
                            <AdminTable columns={['Reference', 'Type', 'Status', 'Summary']}>
                                {reviews.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.review_type}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={badgeToneFor(row.status)}>{row.status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{row.summary}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'secret-rotation' && (
                        <>
                            <AdminCard>
                                <p className="text-sm text-slate-600">Integration API keys older than 6 months: {apiKeysDue}. Rotate via Integrations → API keys.</p>
                            </AdminCard>
                            <AdminTable columns={['Credential', 'Status', 'Due', '']}>
                                {tasks.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{row.credential_type}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.due_at)}</td>
                                        <td className="px-4 py-3">
                                            {row.status !== 'completed' && (
                                                <AdminTextButton type="button" onClick={() => router.post(`/admin/security/rotation-tasks/${row.id}/complete`, { confirm: true })}>
                                                    Mark rotated
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'security-audit-log' && (
                        <>
                            <form
                                className="mb-4 flex gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const q = e.target.elements.q.value;
                                    router.get('/admin/security/operations/security-audit-log', { q }, { preserveState: true });
                                }}
                            >
                                <input name="q" defaultValue={filters.q || ''} placeholder="Search security events" className={inputClass} />
                                <AdminButton type="submit">Search</AdminButton>
                            </form>
                            <AdminTable columns={['When', 'Event', 'Email', 'Outcome', 'IP']}>
                                {(events?.data || []).map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.created_at)}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.event_type}</td>
                                        <td className="px-4 py-3 text-sm">{row.email || row.user?.email || '—'}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={badgeToneFor(row.outcome)}>{row.outcome}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.ip_address || '—'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                            {events && <Pagination links={events.links} />}
                            <AdminCard title="Recent privileged admin actions (sample)">
                                <ul className="space-y-1 text-xs font-mono text-slate-600">
                                    {privilegedSample.map((row) => (
                                        <li key={row.id}>
                                            {formatDate(row.created_at)} — {row.event_type}
                                        </li>
                                    ))}
                                </ul>
                            </AdminCard>
                        </>
                    )}

                    {operation === 'vulnerability-management' && (
                        <>
                            <AdminButton type="button" onClick={() => router.post('/admin/security/vulnerability-scan')}>
                                Run composer audit
                            </AdminButton>
                            <AdminCard>
                                <p className="text-sm text-slate-700">{vuln.message}</p>
                                {vuln.advisories?.length > 0 && (
                                    <AdminTable columns={['Package', 'Advisories']}>
                                        {vuln.advisories.map((row, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 text-sm">{row.package}</td>
                                                <td className="px-4 py-3 text-sm">{row.count}</td>
                                            </tr>
                                        ))}
                                    </AdminTable>
                                )}
                            </AdminCard>
                        </>
                    )}

                    {operation === 'security-incidents' && (
                        <>
                            <AdminCard title="Record incident">
                                <form
                                    className="space-y-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        incidentForm.post('/admin/security/incidents');
                                    }}
                                >
                                    <AdminField label="Severity">
                                        <select className={selectClass} value={incidentForm.data.severity} onChange={(e) => incidentForm.setData('severity', e.target.value)}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Summary">
                                        <textarea className={textareaClass} value={incidentForm.data.summary} onChange={(e) => incidentForm.setData('summary', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Create incident</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Severity', 'Status', 'Summary']}>
                                {incidents.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3">{row.severity}</td>
                                        <td className="px-4 py-3">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{row.summary}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'policy-exceptions' && (
                        <>
                            <AdminCard title="Temporary exception">
                                <form
                                    className="space-y-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        exceptionForm.post('/admin/security/policy-exceptions');
                                    }}
                                >
                                    <AdminField label="Policy key">
                                        <input className={inputClass} value={exceptionForm.data.policy_key} onChange={(e) => exceptionForm.setData('policy_key', e.target.value)} placeholder="sec_mfa_required_admin" />
                                    </AdminField>
                                    <AdminField label="Reason">
                                        <textarea className={textareaClass} value={exceptionForm.data.reason} onChange={(e) => exceptionForm.setData('reason', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Expires at">
                                        <input type="datetime-local" className={inputClass} value={exceptionForm.data.expires_at} onChange={(e) => exceptionForm.setData('expires_at', e.target.value)} />
                                    </AdminField>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={exceptionForm.data.confirm} onChange={(e) => exceptionForm.setData('confirm', e.target.checked)} />
                                        Authorized temporary exception
                                    </label>
                                    <AdminButton type="submit" disabled={!exceptionForm.data.confirm}>
                                        Grant exception
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Policy', 'Expires', 'Status', '']}>
                                {exceptions.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.policy_key}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.expires_at)}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3">
                                            {row.status === 'active' && (
                                                <AdminTextButton type="button" onClick={() => router.post(`/admin/security/policy-exceptions/${row.id}/revoke`)}>
                                                    Revoke
                                                </AdminTextButton>
                                            )}
                                        </td>
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
