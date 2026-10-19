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

export default function GovernanceOperation({
    section,
    operation,
    nav = [],
    operations = [],
    imports = [],
    exports = [],
    changes = [],
    snapshots = [],
    registrySections = [],
    approvals = [],
    scheduled = [],
    simulation = null,
    runbooks = [],
    auditQuery = '',
    auditResults = [],
    issues = [],
    keys = [],
    plainKey = null,
    admins = [],
}) {
    const bulkPreviewForm = useForm({ operation: 'deactivate_dormant_companies', inactive_days: 180 });
    const importForm = useForm({ import_type: 'customers_csv', file: null, field_mapping: {} });
    const exportForm = useForm({ export_type: 'activity_log' });
    const snapshotForm = useForm({ label: '', registry: registrySections[0]?.registry || '', section_id: registrySections[0]?.section || '' });
    const scheduleForm = useForm({ title: '', registry: registrySections[0]?.registry || '', section_id: registrySections[0]?.section || '', payload: {}, effective_at: '', reason: '', approved: false });
    const simulateForm = useForm({ registry: registrySections[0]?.registry || '', section_id: registrySections[0]?.section || '', payload: {} });
    const runbookForm = useForm({ slug: '', title: '', category: 'outage', body: '' });
    const keyForm = useForm({ name: '', scopes: ['reports:read'], confirm: false });

    return (
        <AdminLayout title={section?.title}>
            <AdminPage>
                <AdminHeader eyebrow="Governance" title={section?.title} description={section?.description} backHref="/admin/governance" backLabel="Governance hub" />
                <SettingsSectionNav nav={nav} activeId={operation} basePath="/admin/governance" />
                <AdminBody className="space-y-6">
                    {operation === 'bulk-operations' && (
                        <>
                            <AdminCard title="Preview bulk action">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        bulkPreviewForm.post('/admin/governance/bulk/preview');
                                    }}
                                >
                                    <AdminField label="Operation">
                                        <select className={selectClass} value={bulkPreviewForm.data.operation} onChange={(e) => bulkPreviewForm.setData('operation', e.target.value)}>
                                            <option value="deactivate_dormant_companies">Deactivate dormant companies</option>
                                            <option value="remind_unverified_users">Identify unverified users (preview)</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Inactive days (companies)">
                                        <input type="number" className={inputClass} value={bulkPreviewForm.data.inactive_days} onChange={(e) => bulkPreviewForm.setData('inactive_days', Number(e.target.value))} />
                                    </AdminField>
                                    <AdminButton type="submit">Generate preview</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Operation', 'Impact', 'Status', '']}>
                                {operations.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.operation}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.impact_summary}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={badgeToneFor(row.status)}>{row.status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.status === 'draft' && (
                                                <AdminTextButton
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(`/admin/governance/bulk/${row.id}/execute`, {
                                                            confirm: true,
                                                            impact_ack: true,
                                                        })
                                                    }
                                                >
                                                    Execute
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'import-migration' && (
                        <>
                            <AdminCard title="Validate import">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        importForm.post('/admin/governance/imports', { forceFormData: true });
                                    }}
                                >
                                    <AdminField label="Dataset">
                                        <select className={selectClass} value={importForm.data.import_type} onChange={(e) => importForm.setData('import_type', e.target.value)}>
                                            <option value="customers_csv">Customers (CSV)</option>
                                            <option value="services_csv">Services (CSV)</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="File">
                                        <input type="file" accept=".csv,text/csv" onChange={(e) => importForm.setData('file', e.target.files[0])} />
                                    </AdminField>
                                    <AdminButton type="submit">Validate & preview</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Type', 'Status', 'Rows']}>
                                {imports.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.import_type}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{row.stats?.rows_scanned ?? '—'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'export-jobs' && (
                        <>
                            <AdminCard title="Request export">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        exportForm.post('/admin/governance/exports');
                                    }}
                                >
                                    <AdminField label="Export type">
                                        <select className={selectClass} value={exportForm.data.export_type} onChange={(e) => exportForm.setData('export_type', e.target.value)}>
                                            <option value="activity_log">Activity log</option>
                                            <option value="companies">Companies directory</option>
                                            <option value="audit_bundle">Audit bundle (metadata)</option>
                                        </select>
                                    </AdminField>
                                    <AdminButton type="submit" className="mt-3">
                                        Queue export
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Type', 'Status', 'Rows', 'Expires', '']}>
                                {exports.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.export_type}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{row.row_count ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.expires_at)}</td>
                                        <td className="px-4 py-3">
                                            <AdminTextButton type="button" onClick={() => router.post(`/admin/governance/exports/${row.id}/downloaded`)}>
                                                Log download
                                            </AdminTextButton>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'config-history' && (
                        <AdminTable columns={['When', 'Key', 'Section', 'Admin', 'Old → New']}>
                            {changes.map((row) => (
                                <tr key={row.id}>
                                    <td className="px-4 py-3 text-sm">{formatDate(row.created_at)}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{row.setting_key}</td>
                                    <td className="px-4 py-3 text-sm">{row.section_id || '—'}</td>
                                    <td className="px-4 py-3 text-sm">{row.changed_by?.name || '—'}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        {(row.old_value || '∅').slice(0, 40)} → {(row.new_value || '∅').slice(0, 40)}
                                    </td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'config-versioning' && (
                        <>
                            <AdminCard title="Create snapshot">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        snapshotForm.post('/admin/governance/snapshots');
                                    }}
                                >
                                    <AdminField label="Label" className="sm:col-span-2">
                                        <input className={inputClass} value={snapshotForm.data.label} onChange={(e) => snapshotForm.setData('label', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Section">
                                        <select
                                            className={selectClass}
                                            value={`${snapshotForm.data.registry}::${snapshotForm.data.section_id}`}
                                            onChange={(e) => {
                                                const [registry, section_id] = e.target.value.split('::');
                                                snapshotForm.setData({ ...snapshotForm.data, registry, section_id });
                                            }}
                                        >
                                            {registrySections.map((opt) => (
                                                <option key={`${opt.registry}-${opt.section}`} value={`${opt.registry}::${opt.section}`}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </AdminField>
                                    <AdminButton type="submit">Save snapshot</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Label', 'Section', 'By', 'When', '']}>
                                {snapshots.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{row.label}</td>
                                        <td className="px-4 py-3 text-sm">{row.section_id}</td>
                                        <td className="px-4 py-3 text-sm">{row.created_by?.name}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <AdminTextButton
                                                type="button"
                                                onClick={() =>
                                                    router.post(`/admin/governance/snapshots/${row.id}/restore`, {
                                                        confirm: true,
                                                        scope_ack: true,
                                                    })
                                                }
                                            >
                                                Restore section
                                            </AdminTextButton>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'approval-queue' && (
                        <AdminTable columns={['Type', 'Title', 'Detail', 'Link']}>
                            {approvals.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 text-sm">{row.kind}</td>
                                    <td className="px-4 py-3 text-sm">{row.title}</td>
                                    <td className="px-4 py-3 text-sm">{row.detail}</td>
                                    <td className="px-4 py-3">
                                        <a href={row.href} className="text-sm text-violet-700 hover:underline">
                                            Open
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'scheduled-changes' && (
                        <>
                            <AdminCard title="Schedule change">
                                <p className="mb-3 text-xs text-slate-500">Payload is stored for manual or worker apply at effective time. Use simulation first.</p>
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        scheduleForm.post('/admin/governance/scheduled-changes');
                                    }}
                                >
                                    <AdminField label="Title">
                                        <input className={inputClass} value={scheduleForm.data.title} onChange={(e) => scheduleForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Effective at">
                                        <input type="datetime-local" className={inputClass} value={scheduleForm.data.effective_at} onChange={(e) => scheduleForm.setData('effective_at', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Reason">
                                        <textarea className={textareaClass} value={scheduleForm.data.reason} onChange={(e) => scheduleForm.setData('reason', e.target.value)} />
                                    </AdminField>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={scheduleForm.data.approved} onChange={(e) => scheduleForm.setData('approved', e.target.checked)} />
                                        Approved for scheduling
                                    </label>
                                    <AdminButton type="submit" disabled={!scheduleForm.data.approved}>
                                        Schedule
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Title', 'Effective', 'Status']}>
                                {scheduled.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.title}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.effective_at)}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'action-simulation' && (
                        <>
                            {simulation && (
                                <AdminCard title="Last simulation">
                                    <p className="text-sm font-medium">{simulation.impact}</p>
                                    <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                                        {(simulation.changes || []).map((c, i) => (
                                            <li key={i}>
                                                {c.key}: {String(c.from)} → {String(c.to)}
                                            </li>
                                        ))}
                                    </ul>
                                </AdminCard>
                            )}
                            <AdminCard title="Simulate settings change">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        simulateForm.post('/admin/governance/simulate');
                                    }}
                                >
                                    <AdminField label="Section">
                                        <select
                                            className={selectClass}
                                            onChange={(e) => {
                                                const [registry, section_id] = e.target.value.split('::');
                                                simulateForm.setData({ registry, section_id, payload: {} });
                                            }}
                                        >
                                            {registrySections.map((opt) => (
                                                <option key={`${opt.registry}-${opt.section}`} value={`${opt.registry}::${opt.section}`}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </AdminField>
                                    <p className="mt-2 text-xs text-slate-500">Use Settings UI to draft payload keys; simulation compares submitted JSON payload to live values.</p>
                                    <AdminField label="Payload (JSON)">
                                        <textarea
                                            className={textareaClass}
                                            defaultValue="{}"
                                            onBlur={(e) => {
                                                try {
                                                    simulateForm.setData('payload', JSON.parse(e.target.value || '{}'));
                                                } catch {
                                                    /* ignore parse errors until submit */
                                                }
                                            }}
                                        />
                                    </AdminField>
                                    <AdminButton type="submit" className="mt-3">
                                        Run simulation
                                    </AdminButton>
                                </form>
                            </AdminCard>
                        </>
                    )}

                    {operation === 'runbooks' && (
                        <>
                            <AdminCard title="Add runbook">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        runbookForm.post('/admin/governance/runbooks');
                                    }}
                                >
                                    <AdminField label="Slug">
                                        <input className={inputClass} value={runbookForm.data.slug} onChange={(e) => runbookForm.setData('slug', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Title">
                                        <input className={inputClass} value={runbookForm.data.title} onChange={(e) => runbookForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Body">
                                        <textarea className={textareaClass} value={runbookForm.data.body} onChange={(e) => runbookForm.setData('body', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Save</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Slug', 'Title', 'Category', 'Version']}>
                                {runbooks.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                                        <td className="px-4 py-3 text-sm">{row.title}</td>
                                        <td className="px-4 py-3 text-sm">{row.category}</td>
                                        <td className="px-4 py-3 text-sm">{row.version}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'global-audit' && (
                        <>
                            <form
                                className="flex flex-wrap gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const q = new FormData(e.currentTarget).get('q')?.toString() || '';
                                    router.get('/admin/governance/operations/global-audit', { q }, { preserveState: true });
                                }}
                            >
                                <input className={`${inputClass} min-w-[240px] flex-1`} defaultValue={auditQuery} name="q" placeholder="Search actions, metadata, admin email…" />
                                <AdminButton type="submit">Search</AdminButton>
                            </form>
                            <AdminTable columns={['When', 'Action', 'User', 'Outcome']}>
                                {auditResults.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.created_at)}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                                        <td className="px-4 py-3 text-sm">{row.user?.email || '—'}</td>
                                        <td className="px-4 py-3 text-sm">{row.outcome}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'reconciliation' && (
                        <AdminTable columns={['Severity', 'Type', 'Detail']}>
                            {issues.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3">
                                        <AdminBadge tone={row.severity === 'high' ? 'danger' : 'warning'}>{row.severity}</AdminBadge>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{row.type}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{row.detail || row.count}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'admin-api' && (
                        <>
                            {plainKey && (
                                <AdminCard className="border-amber-200 bg-amber-50">
                                    <p className="text-sm font-medium">Copy the key now — it will not be shown again.</p>
                                    <code className="mt-2 block break-all text-xs">{plainKey}</code>
                                </AdminCard>
                            )}
                            <AdminCard title="Issue automation key">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        keyForm.post('/admin/governance/automation-keys');
                                    }}
                                >
                                    <AdminField label="Name">
                                        <input className={inputClass} value={keyForm.data.name} onChange={(e) => keyForm.setData('name', e.target.value)} />
                                    </AdminField>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={keyForm.data.confirm} onChange={(e) => keyForm.setData('confirm', e.target.checked)} />
                                        Authorized for scoped admin automation
                                    </label>
                                    <AdminButton type="submit" disabled={!keyForm.data.confirm}>
                                        Issue key
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Name', 'Prefix', 'Scopes', '']}>
                                {keys.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{row.name}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.key_prefix}</td>
                                        <td className="px-4 py-3 text-xs">{(row.scopes || []).join(', ')}</td>
                                        <td className="px-4 py-3">
                                            {!row.revoked_at && (
                                                <AdminTextButton type="button" onClick={() => router.post(`/admin/governance/automation-keys/${row.id}/revoke`)}>
                                                    Revoke
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'admin-access-review' && (
                        <AdminTable columns={['Admin', 'Active', 'Verified', 'Last activity', 'Flag']}>
                            {admins.map((row) => (
                                <tr key={row.id}>
                                    <td className="px-4 py-3 text-sm">
                                        {row.name}
                                        <div className="text-xs text-slate-500">{row.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{row.is_active ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 text-sm">{row.email_verified_at ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 text-sm">{formatDate(row.last_activity)}</td>
                                    <td className="px-4 py-3">{row.inactive_privileged ? <AdminBadge tone="warning">Review</AdminBadge> : '—'}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
