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
    checkboxClass,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

const textareaClass = `${inputClass} min-h-[80px]`;

export default function InfrastructureOperation({
    section,
    operation,
    nav = [],
    database = {},
    queue = {},
    tasks = [],
    backups = [],
    restoreTests = [],
    storage = {},
    failedJobs = [],
    logLines = [],
    issues = [],
    windows = [],
    maintenanceOn = false,
    rpo_hours,
    rto_hours,
    restore_interval_days,
    last_passed,
}) {
    const backupForm = useForm({ destination: '', status: 'completed', encrypted: true, size_bytes: '', notes: '' });
    const restoreForm = useForm({ status: 'passed', result_notes: '', confirm: false });
    const windowForm = useForm({ title: '', starts_at: '', ends_at: '', pause_queues: true, maintenance_mode: false, notes: '' });

    return (
        <AdminLayout title={section?.title}>
            <AdminPage>
                <AdminHeader eyebrow="Infrastructure" title={section?.title} description={section?.description} backHref="/admin/infrastructure" backLabel="Infrastructure hub" />
                <SettingsSectionNav nav={nav} activeId={operation} basePath="/admin/infrastructure" />
                <AdminBody className="space-y-6">
                    {operation === 'database-health' && (
                        <>
                            <AdminCard>
                                <p className="text-sm">
                                    Driver: <strong>{database.driver}</strong> · DB: {database.database} ·{' '}
                                    <AdminBadge tone={database.connected ? 'success' : 'danger'}>{database.connected ? 'Connected' : 'Down'}</AdminBadge>
                                </p>
                                <p className="mt-2 text-xs text-slate-500">{database.note}</p>
                            </AdminCard>
                            <AdminTable columns={['Entity', 'Rows']}>
                                {Object.entries(database.row_counts || {}).map(([k, v]) => (
                                    <tr key={k}>
                                        <td className="px-4 py-3 text-sm capitalize">{k}</td>
                                        <td className="px-4 py-3 text-sm">{v}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                            {database.table_samples?.length > 0 && (
                                <AdminTable columns={['Table', 'Rows', 'Size MB']}>
                                    {database.table_samples.map((row) => (
                                        <tr key={row.name}>
                                            <td className="px-4 py-3 font-mono text-xs">{row.name}</td>
                                            <td className="px-4 py-3 text-sm">{row.rows}</td>
                                            <td className="px-4 py-3 text-sm">{row.size_mb}</td>
                                        </tr>
                                    ))}
                                </AdminTable>
                            )}
                        </>
                    )}

                    {operation === 'queue-workers' && (
                        <AdminCard title="Queue status">
                            <p className="text-sm">Driver: {queue.driver}</p>
                            <p className="text-sm">Pending: {queue.pending}</p>
                            <p className="text-sm">Failed: {queue.failed}</p>
                            <p className="mt-2 text-xs text-slate-500">{queue.note}</p>
                        </AdminCard>
                    )}

                    {operation === 'scheduled-tasks' && (
                        <AdminTable columns={['Command', 'Schedule', 'Purpose']}>
                            {tasks.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 font-mono text-xs">{row.command}</td>
                                    <td className="px-4 py-3 text-sm">{row.schedule}</td>
                                    <td className="px-4 py-3 text-sm">{row.purpose}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'backup-management' && (
                        <>
                            <AdminCard title="Record backup run">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        backupForm.post('/admin/infrastructure/backups');
                                    }}
                                >
                                    <AdminField label="Destination">
                                        <input className={inputClass} value={backupForm.data.destination} onChange={(e) => backupForm.setData('destination', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Status">
                                        <select className={selectClass} value={backupForm.data.status} onChange={(e) => backupForm.setData('status', e.target.value)}>
                                            <option value="completed">Completed</option>
                                            <option value="failed">Failed</option>
                                            <option value="partial">Partial</option>
                                        </select>
                                    </AdminField>
                                    <AdminButton type="submit">Log backup</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Destination', 'Status', 'When']}>
                                {backups.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.destination}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.completed_at || row.created_at)}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'restore-dr' && (
                        <>
                            <AdminCard title="Record restore test">
                                <form
                                    className="space-y-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        restoreForm.post('/admin/infrastructure/restore-tests');
                                    }}
                                >
                                    <AdminField label="Result">
                                        <select className={selectClass} value={restoreForm.data.status} onChange={(e) => restoreForm.setData('status', e.target.value)}>
                                            <option value="passed">Passed</option>
                                            <option value="failed">Failed</option>
                                            <option value="planned">Planned</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Notes">
                                        <textarea className={textareaClass} value={restoreForm.data.result_notes} onChange={(e) => restoreForm.setData('result_notes', e.target.value)} />
                                    </AdminField>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={restoreForm.data.confirm} onChange={(e) => restoreForm.setData('confirm', e.target.checked)} />
                                        Authorized restore test documentation
                                    </label>
                                    <AdminButton type="submit" disabled={!restoreForm.data.confirm}>
                                        Save test result
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Status', 'Tested', 'Notes']}>
                                {restoreTests.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.tested_at)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.result_notes || '—'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'storage-management' && (
                        <AdminTable columns={['Area', 'Size (MB)']}>
                            {Object.entries(storage).map(([k, v]) => (
                                <tr key={k}>
                                    <td className="px-4 py-3 text-sm">{k.replace(/_/g, ' ')}</td>
                                    <td className="px-4 py-3 text-sm">{v}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'failed-jobs' && (
                        <AdminTable columns={['Failed', 'Queue', 'Error', '']}>
                            {failedJobs.map((row) => (
                                <tr key={row.uuid}>
                                    <td className="px-4 py-3 text-sm">{formatDate(row.failed_at)}</td>
                                    <td className="px-4 py-3 text-sm">{row.queue}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{row.exception}</td>
                                    <td className="px-4 py-3">
                                        <AdminTextButton
                                            type="button"
                                            onClick={() =>
                                                router.post('/admin/infrastructure/failed-jobs/retry', {
                                                    uuid: row.uuid,
                                                    confirm: true,
                                                    duplicate_ack: true,
                                                })
                                            }
                                        >
                                            Retry
                                        </AdminTextButton>
                                    </td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'system-logs' && (
                        <pre className="max-h-[32rem] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100">{logLines.join('\n')}</pre>
                    )}

                    {operation === 'data-integrity' && (
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

                    {operation === 'maintenance-windows' && (
                        <>
                            <AdminCard>
                                <p className="text-sm">
                                    Platform maintenance mode: <AdminBadge tone={maintenanceOn ? 'warning' : 'success'}>{maintenanceOn ? 'ON' : 'Off'}</AdminBadge> — configure in Maintenance controls or Settings.
                                </p>
                            </AdminCard>
                            <AdminCard title="Schedule window">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        windowForm.post('/admin/infrastructure/maintenance-windows');
                                    }}
                                >
                                    <AdminField label="Title" className="sm:col-span-2">
                                        <input className={inputClass} value={windowForm.data.title} onChange={(e) => windowForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Starts">
                                        <input type="datetime-local" className={inputClass} value={windowForm.data.starts_at} onChange={(e) => windowForm.setData('starts_at', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Ends">
                                        <input type="datetime-local" className={inputClass} value={windowForm.data.ends_at} onChange={(e) => windowForm.setData('ends_at', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Schedule</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Title', 'Starts', 'Status', 'Queues pause']}>
                                {windows.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{row.title}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.starts_at)}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{row.pause_queues ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'dr-metrics' && (
                        <AdminCard title="Recovery objectives">
                            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                                <div>
                                    <dt className="text-slate-500">RPO target</dt>
                                    <dd className="text-lg font-semibold">{rpo_hours}h</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">RTO target</dt>
                                    <dd className="text-lg font-semibold">{rto_hours}h</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Restore test cadence</dt>
                                    <dd>{restore_interval_days} days</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Last passed test</dt>
                                    <dd>{last_passed?.tested_at ? formatDate(last_passed.tested_at) : 'None recorded'}</dd>
                                </div>
                            </dl>
                        </AdminCard>
                    )}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
