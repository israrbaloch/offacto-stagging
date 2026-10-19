import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import CommunicationMergeCodesReference from '../../../Components/Admin/CommunicationMergeCodesReference';
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
    selectClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

const SAMPLE = {
    '#CLIENTNAME#': 'Sample Client BV',
    '#COMPANY#': 'Demo Company',
    '#OFFERLINK#': 'https://offacto.test/q/sample-token',
    '#INVOICENUMBER#': 'INV-2026-0042',
    '#PAYLINK#': 'https://pay.example.test/checkout/sample',
};

function sampleMerge(text) {
    if (!text) return '';
    return Object.entries(SAMPLE).reduce((acc, [code, val]) => acc.split(code).join(val), text);
}

export default function CommunicationsOperation({
    section,
    operation,
    nav = [],
    templates = {},
    templateLabels = {},
    mergeCatalog = {},
    analytics = {},
    queuePending = 0,
    failedJobs = [],
    history = [],
    metadataOnly = true,
}) {
    const templateKeys = Object.keys(templates);
    const [selectedTemplate, setSelectedTemplate] = useState(templateKeys[0] || 'invoice_sent');
    const testForm = useForm({ template_key: selectedTemplate, confirm_test: false });

    const preview = useMemo(() => {
        const tpl = templates[selectedTemplate] || { subject: '', body: '' };
        return {
            subject: sampleMerge(tpl.subject || ''),
            body: sampleMerge(tpl.body || ''),
        };
    }, [templates, selectedTemplate]);

    return (
        <AdminLayout title={section?.title}>
            <AdminPage>
                <AdminHeader
                    eyebrow="Communications"
                    title={section?.title}
                    description={section?.description}
                    backHref="/admin/communications"
                    backLabel="Communications hub"
                />
                <SettingsSectionNav nav={nav} activeId={operation} basePath="/admin/communications" />
                <AdminBody className="space-y-6">
                    {operation === 'preview-testing' && (
                        <>
                            <AdminCard title="Preview with sample data">
                                <AdminField label="Template">
                                    <select className={selectClass} value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                                        {templateKeys.map((key) => (
                                            <option key={key} value={key}>
                                                {templateLabels[key] || key}
                                            </option>
                                        ))}
                                    </select>
                                </AdminField>
                                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                    <p className="text-xs font-medium uppercase text-slate-500">Subject preview</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{preview.subject || '—'}</p>
                                    <p className="mt-4 text-xs font-medium uppercase text-slate-500">Body preview</p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{preview.body || '(default mailable layout)'}</p>
                                </div>
                            </AdminCard>
                            <AdminCard title="Send test to your admin email">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        testForm.setData('template_key', selectedTemplate);
                                        testForm.post('/admin/communications/test-send');
                                    }}
                                >
                                    <label className="flex items-start gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={testForm.data.confirm_test} onChange={(e) => testForm.setData('confirm_test', e.target.checked)} />
                                        Send only to my logged-in email — not a customer.
                                    </label>
                                    <AdminButton type="submit" disabled={!testForm.data.confirm_test || testForm.processing}>
                                        Send test
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <CommunicationMergeCodesReference mergeCatalog={mergeCatalog} compact title="Personalization codes for tests" />
                        </>
                    )}

                    {operation === 'delivery-analytics' && (
                        <>
                            <AdminCard>
                                <p className="text-sm text-slate-600">{analytics.note}</p>
                            </AdminCard>
                            <AdminTable columns={['Status', 'Count (30d)']}>
                                {Object.entries(analytics.by_status || {}).map(([status, total]) => (
                                    <tr key={status}>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={badgeToneFor(status)}>{status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{total}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'queue-monitor' && (
                        <>
                            <AdminMetricStrip pending={queuePending} failed={failedJobs.length} />
                            <AdminTable columns={['Failed at', 'Queue', 'Error', '']}>
                                {failedJobs.map((row) => (
                                    <tr key={row.uuid}>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.failed_at)}</td>
                                        <td className="px-4 py-3 text-sm">{row.queue}</td>
                                        <td className="px-4 py-3 text-xs text-slate-600">{row.exception}</td>
                                        <td className="px-4 py-3">
                                            <AdminTextButton
                                                type="button"
                                                onClick={() => router.post('/admin/communications/queue/retry', { uuid: row.uuid, confirm: true })}
                                            >
                                                Retry
                                            </AdminTextButton>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'communication-history' && (
                        <>
                            {metadataOnly && (
                                <AdminCard className="border-slate-200 bg-slate-50/50" padding={true}>
                                    <p className="text-sm text-slate-600">Message bodies are not listed here. Use provider tools for full content when authorized.</p>
                                </AdminCard>
                            )}
                            <AdminTable columns={['When', 'Template', 'Recipient', 'Company', 'Status', 'Subject']}>
                                {history.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.at)}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.template_key || row.event_type}</td>
                                        <td className="px-4 py-3 text-sm">{row.recipient_masked}</td>
                                        <td className="px-4 py-3 text-sm">{row.company || '—'}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={badgeToneFor(row.status)}>{row.status}</AdminBadge>
                                            {row.is_test && <span className="ml-1 text-xs text-slate-400">test</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.subject || '—'}</td>
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

function AdminMetricStrip({ pending, failed }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
                <p className="text-xs uppercase text-slate-500">Jobs queued</p>
                <p className="text-2xl font-semibold text-slate-900">{pending}</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
                <p className="text-xs uppercase text-slate-500">Failed jobs</p>
                <p className="text-2xl font-semibold text-slate-900">{failed}</p>
            </div>
        </div>
    );
}
