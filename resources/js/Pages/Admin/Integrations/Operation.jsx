import { router, useForm, usePage } from '@inertiajs/react';
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
import { INTEGRATION_API_SCOPES, slugifyLabel } from '../../../lib/adminSettingOptions';
import { formatDate } from '../../../lib/utils';

const textareaClass = `${inputClass} min-h-[80px]`;

function ScopeCheckboxes({ scopes, onChange }) {
    const toggle = (scope) => {
        const next = scopes.includes(scope) ? scopes.filter((s) => s !== scope) : [...scopes, scope];
        onChange(next.length ? next : ['read']);
    };
    return (
        <div className="flex flex-wrap gap-3">
            {INTEGRATION_API_SCOPES.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className={checkboxClass} checked={scopes.includes(opt.value)} onChange={() => toggle(opt.value)} />
                    {opt.label}
                </label>
            ))}
        </div>
    );
}

export default function IntegrationsOperation({
    section,
    operation,
    nav = [],
    webhooks = [],
    apiKeys = [],
    newKeyPlain = null,
    healthResults = [],
    failures = [],
    providers = [],
}) {
    const webhookForm = useForm({ name: '', url: '', signing_secret: '', active: true });
    const apiKeyForm = useForm({ name: '', scopes: ['read'] });
    const providerForm = useForm({
        slug: '',
        name: '',
        purpose: '',
        data_access: '',
        operational_status: 'active',
        compliance_doc_url: '',
    });

    const { flash } = usePage().props;
    const displayedNewKey = newKeyPlain || flash?.integration_api_key_plain;

    return (
        <AdminLayout title={section?.title}>
            <AdminPage>
                <AdminHeader
                    eyebrow="Integrations"
                    title={section?.title}
                    description={section?.description}
                    backHref="/admin/integrations"
                    backLabel="Integration hub"
                />
                <SettingsSectionNav nav={nav} activeId={operation} basePath="/admin/integrations" />
                <AdminBody className="space-y-6">
                    {operation === 'webhooks' && (
                        <>
                            <AdminCard title="Register webhook endpoint">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        webhookForm.post('/admin/integrations/webhooks');
                                    }}
                                >
                                    <AdminField label="Name">
                                        <input className={inputClass} value={webhookForm.data.name} onChange={(e) => webhookForm.setData('name', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="HTTPS URL">
                                        <input className={inputClass} value={webhookForm.data.url} onChange={(e) => webhookForm.setData('url', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Signing secret (optional)">
                                        <input type="password" className={inputClass} value={webhookForm.data.signing_secret} onChange={(e) => webhookForm.setData('signing_secret', e.target.value)} autoComplete="new-password" />
                                    </AdminField>
                                    <AdminButton type="submit">Add webhook</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Name', 'URL', 'Active', '']}>
                                {webhooks.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm font-medium">{row.name}</td>
                                        <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-600">{row.url}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={row.active ? 'success' : 'neutral'}>{row.active ? 'Active' : 'Off'}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <AdminTextButton type="button" onClick={() => router.patch(`/admin/integrations/webhooks/${row.id}/toggle`)}>
                                                Toggle
                                            </AdminTextButton>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'api-keys' && (
                        <>
                            {displayedNewKey && (
                                <AdminCard className="border-emerald-200 bg-emerald-50/60" title="Copy API key now">
                                    <p className="mb-2 text-sm text-slate-600">This key is shown once.</p>
                                    <code className="block break-all rounded-lg bg-white p-3 text-xs">{displayedNewKey}</code>
                                </AdminCard>
                            )}
                            <AdminCard title="Issue API key">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        apiKeyForm.post('/admin/integrations/api-keys');
                                    }}
                                >
                                    <AdminField label="Label">
                                        <input className={inputClass} value={apiKeyForm.data.name} onChange={(e) => apiKeyForm.setData('name', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Permissions" className="sm:col-span-2">
                                        <ScopeCheckboxes
                                            scopes={apiKeyForm.data.scopes || ['read']}
                                            onChange={(scopes) => apiKeyForm.setData('scopes', scopes)}
                                        />
                                    </AdminField>
                                    <AdminButton type="submit">Create key</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Name', 'Prefix', 'Last used', 'Status', '']}>
                                {apiKeys.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{row.name}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.key_prefix}…</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.last_used_at)}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={row.revoked_at ? 'danger' : 'success'}>{row.revoked_at ? 'Revoked' : 'Active'}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3">
                                            {!row.revoked_at && (
                                                <AdminTextButton type="button" onClick={() => router.post(`/admin/integrations/api-keys/${row.id}/revoke`)}>
                                                    Revoke
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'health-checks' && (
                        <>
                            <AdminButton type="button" onClick={() => router.post('/admin/integrations/health-checks/run')}>
                                Run connectivity tests
                            </AdminButton>
                            <AdminTable columns={['Integration', 'Status', 'Detail']}>
                                {healthResults.map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3 text-sm font-medium">{row.name}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={row.status === 'ok' ? 'success' : row.status === 'warn' ? 'warning' : 'danger'}>{row.status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.detail}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'failure-queue' && (
                        <AdminTable columns={['When', 'Provider', 'Operation', 'Reference', 'Message']}>
                            {failures.map((row) => (
                                <tr key={row.id}>
                                    <td className="px-4 py-3 text-sm">{formatDate(row.at)}</td>
                                    <td className="px-4 py-3 text-sm">{row.provider}</td>
                                    <td className="px-4 py-3 text-sm">{row.operation}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{row.reference || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{row.message}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'provider-registry' && (
                        <>
                            <AdminCard title="Add provider">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const slug = providerForm.data.slug || slugifyLabel(providerForm.data.name);
                                        providerForm.transform((data) => ({ ...data, slug })).post('/admin/integrations/providers');
                                    }}
                                >
                                    <AdminField label="Provider name" className="sm:col-span-2">
                                        <input
                                            className={inputClass}
                                            value={providerForm.data.name}
                                            onChange={(e) => providerForm.setData('name', e.target.value)}
                                            placeholder="e.g. Mollie"
                                        />
                                    </AdminField>
                                    <AdminField label="Purpose" className="sm:col-span-2">
                                        <textarea className={textareaClass} value={providerForm.data.purpose} onChange={(e) => providerForm.setData('purpose', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Data access" className="sm:col-span-2">
                                        <textarea className={textareaClass} value={providerForm.data.data_access} onChange={(e) => providerForm.setData('data_access', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Status">
                                        <select className={selectClass} value={providerForm.data.operational_status} onChange={(e) => providerForm.setData('operational_status', e.target.value)}>
                                            <option value="active">Active</option>
                                            <option value="deprecated">Deprecated</option>
                                            <option value="disabled">Disabled</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Privacy or DPA document link">
                                        <input className={inputClass} value={providerForm.data.compliance_doc_url} onChange={(e) => providerForm.setData('compliance_doc_url', e.target.value)} placeholder="https://…" />
                                    </AdminField>
                                    <AdminButton type="submit">Save provider</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Name', 'Purpose', 'Status', 'Compliance']}>
                                {providers.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm font-medium">{row.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.purpose}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={badgeToneFor(row.operational_status)}>{row.operational_status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {row.compliance_doc_url ? (
                                                <a href={row.compliance_doc_url} className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">
                                                    Document
                                                </a>
                                            ) : (
                                                '—'
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
