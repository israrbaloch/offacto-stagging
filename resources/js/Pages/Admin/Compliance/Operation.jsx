import axios from 'axios';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
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

const textareaClass = `${inputClass} min-h-[100px]`;
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

function LawfulBanner() {
    return (
        <AdminCard className="border-amber-100 bg-amber-50/50" padding={true}>
            <p className="text-sm text-slate-700">
                Document and verify each request. Do not use this area for routine customer support or undisclosed account access.
            </p>
        </AdminCard>
    );
}

export default function ComplianceOperation({
    section,
    operation,
    nav = [],
    notices = [],
    consents = [],
    requests = [],
    holds = [],
    jobs = [],
    privacy = {},
    breaches = [],
    authorityRequests = [],
    reviewMode = false,
    evidence = [],
    disclosures = [],
    cases = [],
    peppol = [],
}) {
    const [confirmExport, setConfirmExport] = useState(false);
    const [exporting, setExporting] = useState(false);

    const dsarForm = useForm({ request_type: 'access', subject_email: '', notes: '' });
    const noticeForm = useForm({
        type: 'privacy',
        locale: 'en',
        version_label: '',
        title: '',
        body: '',
        publish: false,
    });
    const authorityForm = useForm({
        requesting_authority: '',
        jurisdiction: 'BE',
        legal_basis: '',
        scope_summary: '',
        is_emergency: false,
        emergency_acknowledged: false,
    });
    const disclosureForm = useForm({
        authority_request_id: '',
        disclosed_to: '',
        scope_record: '',
        customer_notification: 'not_applicable',
        legal_confirm: false,
        scope_confirm: false,
    });
    const evidenceForm = useForm({ authority_request_id: '', record_type: '', record_reference: '', content_hash: '' });
    const holdForm = useForm({ title: '', scope_description: '' });
    const deletionForm = useForm({ category: 'logs', summary: '', scheduled_for: '' });
    const breachForm = useForm({ severity: 'medium', summary: '', discovered_at: new Date().toISOString().slice(0, 16) });

    const downloadReport = async () => {
        const xsrf = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        setExporting(true);
        try {
            const { data, headers } = await axios.post(
                '/admin/compliance/reports/export',
                { confirm: true },
                { responseType: 'blob', headers: xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {} },
            );
            const disposition = headers['content-disposition'] || '';
            const match = disposition.match(/filename="?([^";]+)"?/i);
            const filename = match?.[1] || 'compliance-report.csv';
            const url = URL.createObjectURL(data);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            anchor.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    const advanceAuthority = (id, action) => {
        router.patch(`/admin/compliance/authority-requests/${id}/advance`, { action });
    };

    return (
        <AdminLayout title={section?.title}>
            <AdminPage>
                <AdminHeader
                    eyebrow="Compliance"
                    title={section?.title}
                    description={section?.description}
                    backHref="/admin/compliance"
                    backLabel="Compliance hub"
                />
                <SettingsSectionNav nav={nav} activeId={operation} basePath="/admin/compliance" />
                <AdminBody className="space-y-6">
                    {['authority-requests', 'legal-request-review', 'controlled-disclosure', 'evidence-preservation'].includes(operation) && (
                        <LawfulBanner />
                    )}

                    {operation === 'legal-notices' && (
                        <>
                            <AdminCard title="Publish notice version">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        noticeForm.post('/admin/compliance/legal-notices');
                                    }}
                                >
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <AdminField label="Type">
                                            <select className={selectClass} value={noticeForm.data.type} onChange={(e) => noticeForm.setData('type', e.target.value)}>
                                                <option value="terms">Terms</option>
                                                <option value="privacy">Privacy</option>
                                                <option value="dpa">DPA</option>
                                                <option value="cookies">Cookies</option>
                                            </select>
                                        </AdminField>
                                        <AdminField label="Locale">
                                            <input className={inputClass} value={noticeForm.data.locale} onChange={(e) => noticeForm.setData('locale', e.target.value)} />
                                        </AdminField>
                                        <AdminField label="Version label">
                                            <input className={inputClass} value={noticeForm.data.version_label} onChange={(e) => noticeForm.setData('version_label', e.target.value)} />
                                        </AdminField>
                                        <AdminField label="Title">
                                            <input className={inputClass} value={noticeForm.data.title} onChange={(e) => noticeForm.setData('title', e.target.value)} />
                                        </AdminField>
                                    </div>
                                    <AdminField label="Body">
                                        <textarea className={textareaClass} rows={6} value={noticeForm.data.body} onChange={(e) => noticeForm.setData('body', e.target.value)} />
                                    </AdminField>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={noticeForm.data.publish} onChange={(e) => noticeForm.setData('publish', e.target.checked)} />
                                        Publish now (supersedes current version for this type/locale)
                                    </label>
                                    <AdminButton type="submit" disabled={noticeForm.processing}>
                                        Save notice
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Type', 'Locale', 'Version', 'Published', 'Author']}>
                                {notices.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{row.type}</td>
                                        <td className="px-4 py-3 text-sm">{row.locale}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{row.version_label}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.published_at)}</td>
                                        <td className="px-4 py-3 text-sm">{row.author || '—'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'consent-records' && (
                        <AdminTable columns={['Type', 'Email', 'Notice version', 'Accepted', 'Withdrawn']}>
                            {consents.map((row) => (
                                <tr key={row.id}>
                                    <td className="px-4 py-3 text-sm">{row.consent_type}</td>
                                    <td className="px-4 py-3 text-sm">{row.email}</td>
                                    <td className="px-4 py-3 text-sm">{row.notice_version || '—'}</td>
                                    <td className="px-4 py-3 text-sm">{formatDate(row.accepted_at)}</td>
                                    <td className="px-4 py-3 text-sm">{formatDate(row.withdrawn_at)}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'data-subject-requests' && (
                        <>
                            <AdminCard title="Register request (manual intake)">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        dsarForm.post('/admin/compliance/dsar');
                                    }}
                                >
                                    <AdminField label="Request type">
                                        <select className={selectClass} value={dsarForm.data.request_type} onChange={(e) => dsarForm.setData('request_type', e.target.value)}>
                                            <option value="access">Access</option>
                                            <option value="correction">Correction</option>
                                            <option value="export">Export</option>
                                            <option value="restriction">Restriction</option>
                                            <option value="deletion">Deletion</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Subject email">
                                        <input type="email" className={inputClass} value={dsarForm.data.subject_email} onChange={(e) => dsarForm.setData('subject_email', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Notes" className="sm:col-span-2">
                                        <textarea className={textareaClass} rows={2} value={dsarForm.data.notes} onChange={(e) => dsarForm.setData('notes', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit" disabled={dsarForm.processing}>
                                        Create request
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Type', 'Status', 'Email', 'Due', 'Actions']}>
                                {requests.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.request_type}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={badgeToneFor(row.status)}>{row.status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{row.subject_email}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.due_at)}</td>
                                        <td className="px-4 py-3">
                                            <AdminTextButton type="button" onClick={() => router.patch(`/admin/compliance/dsar/${row.id}`, { status: 'in_progress', identity_verified: true })}>
                                                Verify & progress
                                            </AdminTextButton>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'legal-holds' && (
                        <>
                            <AdminCard title="Place legal hold">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        holdForm.post('/admin/compliance/legal-holds');
                                    }}
                                >
                                    <AdminField label="Title">
                                        <input className={inputClass} value={holdForm.data.title} onChange={(e) => holdForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Scope">
                                        <textarea className={textareaClass} rows={3} value={holdForm.data.scope_description} onChange={(e) => holdForm.setData('scope_description', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Place hold</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Title', 'Status', 'Placed', '']}>
                                {(holds || []).map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.title}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={row.status === 'active' ? 'warning' : 'neutral'}>{row.status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.placed_at)}</td>
                                        <td className="px-4 py-3">
                                            {row.status === 'active' && (
                                                <AdminTextButton type="button" onClick={() => router.post(`/admin/compliance/legal-holds/${row.id}/release`, { confirm: true })}>
                                                    Release
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'deletion-jobs' && (
                        <>
                            <AdminCard title="Schedule deletion / anonymization">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        deletionForm.post('/admin/compliance/deletion-jobs');
                                    }}
                                >
                                    <AdminField label="Category">
                                        <input className={inputClass} value={deletionForm.data.category} onChange={(e) => deletionForm.setData('category', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Scheduled for">
                                        <input type="date" className={inputClass} value={deletionForm.data.scheduled_for} onChange={(e) => deletionForm.setData('scheduled_for', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Summary" className="sm:col-span-2">
                                        <input className={inputClass} value={deletionForm.data.summary} onChange={(e) => deletionForm.setData('summary', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Create job</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Category', 'Status', 'Summary', '']}>
                                {(jobs || []).map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.category}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{row.summary}</td>
                                        <td className="px-4 py-3">
                                            {row.status === 'pending' && (
                                                <AdminTextButton type="button" onClick={() => router.post(`/admin/compliance/deletion-jobs/${row.id}/approve`, { confirm: true })}>
                                                    Approve
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'privacy-access' && (
                        <>
                            <AdminCard title="Guidance">
                                <p className="text-sm text-slate-600">{privacy.note}</p>
                            </AdminCard>
                            <AdminTable columns={['When', 'Action', 'Outcome', 'Subject']}>
                                {(privacy.admin_activity || []).map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.at)}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                                        <td className="px-4 py-3 text-sm">{row.outcome}</td>
                                        <td className="px-4 py-3 text-sm">{row.subject || '—'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'breach-management' && (
                        <>
                            <AdminCard title="Record incident">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        breachForm.post('/admin/compliance/breaches');
                                    }}
                                >
                                    <AdminField label="Severity">
                                        <select className={selectClass} value={breachForm.data.severity} onChange={(e) => breachForm.setData('severity', e.target.value)}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Discovered at">
                                        <input type="datetime-local" className={inputClass} value={breachForm.data.discovered_at} onChange={(e) => breachForm.setData('discovered_at', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Summary" className="sm:col-span-2">
                                        <textarea className={textareaClass} rows={3} value={breachForm.data.summary} onChange={(e) => breachForm.setData('summary', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Record breach</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Severity', 'Status', 'Discovered', 'Deadline']}>
                                {(breaches || []).map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={row.severity === 'critical' ? 'danger' : 'warning'}>{row.severity}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.discovered_at)}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.notification_deadline_at)}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {(operation === 'authority-requests' || operation === 'legal-request-review') && (
                        <>
                            {!reviewMode && (
                                <AdminCard title="Register authority request">
                                    <form
                                        className="space-y-3"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            authorityForm.post('/admin/compliance/authority-requests');
                                        }}
                                    >
                                        <AdminField label="Requesting authority">
                                            <input className={inputClass} value={authorityForm.data.requesting_authority} onChange={(e) => authorityForm.setData('requesting_authority', e.target.value)} />
                                        </AdminField>
                                        <AdminField label="Jurisdiction">
                                            <input className={inputClass} value={authorityForm.data.jurisdiction} onChange={(e) => authorityForm.setData('jurisdiction', e.target.value)} />
                                        </AdminField>
                                        <AdminField label="Legal basis (as stated on request)">
                                            <textarea className={textareaClass} rows={2} value={authorityForm.data.legal_basis} onChange={(e) => authorityForm.setData('legal_basis', e.target.value)} />
                                        </AdminField>
                                        <AdminField label="Requested scope summary">
                                            <textarea className={textareaClass} rows={3} value={authorityForm.data.scope_summary} onChange={(e) => authorityForm.setData('scope_summary', e.target.value)} />
                                        </AdminField>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={authorityForm.data.is_emergency} onChange={(e) => authorityForm.setData('is_emergency', e.target.checked)} />
                                            Emergency request (requires retrospective review)
                                        </label>
                                        {authorityForm.data.is_emergency && (
                                            <label className="flex items-start gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    className={checkboxClass}
                                                    checked={authorityForm.data.emergency_acknowledged}
                                                    onChange={(e) => authorityForm.setData('emergency_acknowledged', e.target.checked)}
                                                />
                                                I confirm this meets the narrowly scoped emergency criteria and will be reviewed within policy deadlines.
                                            </label>
                                        )}
                                        <AdminButton type="submit">Register request</AdminButton>
                                    </form>
                                </AdminCard>
                            )}
                            <AdminTable columns={['Reference', 'Authority', 'Status', 'Emergency', 'Received', 'Workflow']}>
                                {authorityRequests.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.requesting_authority}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={badgeToneFor(row.status)}>{row.status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{row.is_emergency ? 'Yes' : '—'}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.received_at)}</td>
                                        <td className="px-4 py-3 space-x-1">
                                            {row.status === 'received' && (
                                                <AdminTextButton type="button" onClick={() => advanceAuthority(row.id, 'start_verification')}>
                                                    Verify
                                                </AdminTextButton>
                                            )}
                                            {row.status === 'verification' && (
                                                <AdminTextButton type="button" onClick={() => advanceAuthority(row.id, 'complete_verification')}>
                                                    Mark verified
                                                </AdminTextButton>
                                            )}
                                            {row.status === 'legal_review' && (
                                                <>
                                                    <AdminTextButton type="button" onClick={() => advanceAuthority(row.id, 'approve_disclosure')}>
                                                        Approve disclosure step
                                                    </AdminTextButton>
                                                    <AdminTextButton type="button" onClick={() => advanceAuthority(row.id, 'reject')}>
                                                        Reject
                                                    </AdminTextButton>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'evidence-preservation' && (
                        <>
                            <AdminCard title="Capture evidence reference">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        evidenceForm.post('/admin/compliance/evidence');
                                    }}
                                >
                                    <AdminField label="Linked authority request">
                                        <select className={selectClass} value={evidenceForm.data.authority_request_id} onChange={(e) => evidenceForm.setData('authority_request_id', e.target.value)}>
                                            <option value="">—</option>
                                            {authorityRequests.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.reference}
                                                </option>
                                            ))}
                                        </select>
                                    </AdminField>
                                    <AdminField label="Record type">
                                        <input className={inputClass} value={evidenceForm.data.record_type} onChange={(e) => evidenceForm.setData('record_type', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Record reference">
                                        <input className={inputClass} value={evidenceForm.data.record_reference} onChange={(e) => evidenceForm.setData('record_reference', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Content hash (optional)">
                                        <input className={inputClass} value={evidenceForm.data.content_hash} onChange={(e) => evidenceForm.setData('content_hash', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Record evidence</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Captured', 'Type', 'Reference', 'Hash']}>
                                {(evidence || []).map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.captured_at)}</td>
                                        <td className="px-4 py-3 text-sm">{row.record_type}</td>
                                        <td className="px-4 py-3 text-sm">{row.record_reference}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.content_hash || '—'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'controlled-disclosure' && (
                        <>
                            <AdminCard title="Record controlled disclosure">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        disclosureForm.post('/admin/compliance/disclosures');
                                    }}
                                >
                                    <AdminField label="Authority request (must be approved for disclosure)">
                                        <select className={selectClass} value={disclosureForm.data.authority_request_id} onChange={(e) => disclosureForm.setData('authority_request_id', e.target.value)}>
                                            <option value="">Select…</option>
                                            {authorityRequests
                                                .filter((r) => r.status === 'awaiting_disclosure')
                                                .map((r) => (
                                                    <option key={r.id} value={r.id}>
                                                        {r.reference} — {r.requesting_authority}
                                                    </option>
                                                ))}
                                        </select>
                                    </AdminField>
                                    <AdminField label="Disclosed to">
                                        <input className={inputClass} value={disclosureForm.data.disclosed_to} onChange={(e) => disclosureForm.setData('disclosed_to', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Exact scope disclosed (minimize data)">
                                        <textarea className={textareaClass} rows={4} value={disclosureForm.data.scope_record} onChange={(e) => disclosureForm.setData('scope_record', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Customer notification">
                                        <select className={selectClass} value={disclosureForm.data.customer_notification} onChange={(e) => disclosureForm.setData('customer_notification', e.target.value)}>
                                            <option value="not_applicable">Not applicable</option>
                                            <option value="permitted">Permitted</option>
                                            <option value="required">Required</option>
                                            <option value="delayed">Delayed</option>
                                            <option value="restricted">Legally restricted</option>
                                        </select>
                                    </AdminField>
                                    <label className="flex items-start gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={disclosureForm.data.legal_confirm} onChange={(e) => disclosureForm.setData('legal_confirm', e.target.checked)} />
                                        Legal/compliance review confirms this disclosure is limited to what is legally required.
                                    </label>
                                    <label className="flex items-start gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={disclosureForm.data.scope_confirm} onChange={(e) => disclosureForm.setData('scope_confirm', e.target.checked)} />
                                        I record precisely what was provided; no automatic full account export was used.
                                    </label>
                                    <AdminButton type="submit" disabled={!disclosureForm.data.legal_confirm || !disclosureForm.data.scope_confirm}>
                                        Record disclosure
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['When', 'Request', 'Disclosed to', 'Notification']}>
                                {(disclosures || []).map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.disclosed_at)}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.authority_request?.reference || row.authority_request_id}</td>
                                        <td className="px-4 py-3 text-sm">{row.disclosed_to}</td>
                                        <td className="px-4 py-3 text-sm">{row.customer_notification}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'compliance-cases' && (
                        <AdminTable columns={['Reference', 'Type', 'Title', 'Status', 'Restricted']}>
                            {(cases || []).map((row) => (
                                <tr key={row.id}>
                                    <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                    <td className="px-4 py-3 text-sm">{row.case_type}</td>
                                    <td className="px-4 py-3 text-sm">{row.title}</td>
                                    <td className="px-4 py-3 text-sm">{row.status}</td>
                                    <td className="px-4 py-3 text-sm">{row.restricted ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'peppol-monitoring' && (
                        <AdminTable columns={['Invoice', 'Sent at', 'Status']}>
                            {(peppol || []).map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 text-sm">{row.document}</td>
                                    <td className="px-4 py-3 text-sm">{formatDate(row.sent_at)}</td>
                                    <td className="px-4 py-3 text-sm">{row.status}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'compliance-reports' && (
                        <AdminCard title="Compliance report export">
                            <label className="mb-4 flex items-start gap-3 text-sm">
                                <input type="checkbox" className={checkboxClass} checked={confirmExport} onChange={(e) => setConfirmExport(e.target.checked)} />
                                <span>I am authorized to export aggregated compliance metrics for internal review.</span>
                            </label>
                            <AdminButton disabled={!confirmExport || exporting} onClick={downloadReport}>
                                {exporting ? 'Preparing…' : 'Download CSV report'}
                            </AdminButton>
                        </AdminCard>
                    )}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
