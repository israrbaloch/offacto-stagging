import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminCard,
    AdminHeader,
    AdminLinkButton,
    AdminPage,
    AdminTabs,
    AdminTimeline,
    badgeToneFor,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'status', label: 'Status' },
    { id: 'verification', label: 'Verification' },
    { id: 'overrides', label: 'Overrides' },
    { id: 'export', label: 'Export' },
    { id: 'retention', label: 'Retention' },
    { id: 'timeline', label: 'Activity' },
];

export default function AdminCompanyShow({
    profile,
    usage = {},
    integrations = {},
    timeline = [],
    statusHistory = [],
    verification = {},
    overrides = [],
    exports: exportRows = [],
    deletionRequests = [],
    planEntitlementCatalog = {},
    statusActions = [],
}) {
    const [tab, setTab] = useState('overview');
    const [statusReason, setStatusReason] = useState('');
    const [statusAction, setStatusAction] = useState(statusActions[0] || 'activate');

    const capabilityOptions = useMemo(() => {
        const groups = planEntitlementCatalog?.groups || [];
        return groups.flatMap((g) => (g.capabilities || []).map((c) => ({ key: c.key, label: c.key })));
    }, [planEntitlementCatalog]);

    const verificationForm = useForm({
        status: verification.status || 'not_required',
        notes: verification.notes || '',
    });

    const overrideForm = useForm({
        capability_key: capabilityOptions[0]?.key || '',
        granted: true,
        reason: '',
        expires_at: '',
    });

    const deletionForm = useForm({
        reason: '',
        retention_days: 30,
        legal_hold: false,
    });

    const postStatus = () => {
        router.post(
            `/admin/companies/${profile.id}/status`,
            { action: statusAction, reason: statusReason || undefined },
            { preserveScroll: true },
        );
    };

    return (
        <AdminLayout title={profile.company_name}>
            <AdminPage>
                <AdminHeader
                    eyebrow="Directory"
                    title={profile.company_name}
                    description={
                        profile.legal_name && profile.legal_name !== profile.company_name
                            ? `Legal: ${profile.legal_name}`
                            : undefined
                    }
                    backHref="/admin/companies"
                    backLabel="Companies"
                    actions={
                        <>
                            <AdminLinkButton href={`/admin/companies/${profile.id}/edit`} variant="secondary">
                                Edit profile
                            </AdminLinkButton>
                            <AdminButton variant="accent" onClick={() => router.post(`/admin/companies/${profile.id}/workspace`)}>
                                Open workspace
                            </AdminButton>
                        </>
                    }
                />
                <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 lg:px-8">
                    <AdminBadge tone={badgeToneFor(profile.approval_status)}>{profile.approval_status || '—'}</AdminBadge>
                    <AdminBadge tone={profile.is_active ? 'success' : 'danger'}>{profile.is_active ? 'Active' : 'Inactive'}</AdminBadge>
                    <AdminBadge tone="neutral">Plan {profile.subscription_plan || '—'}</AdminBadge>
                </div>
                <AdminTabs tabs={TABS} active={tab} onChange={setTab} />
                <AdminBody>
                    {tab === 'overview' && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <AdminCard title="Company details">
                                <dl className="space-y-2 text-sm">
                                    <Row k="Owner" v={profile.owner ? `${profile.owner.name} (${profile.owner.email})` : '—'} />
                                    <Row k="Email / phone" v={`${profile.email} · ${profile.phone}`} />
                                    <Row k="VAT" v={profile.vat_number} />
                                    <Row k="Address" v={`${profile.street} ${profile.house}, ${profile.postal_code} ${profile.city}`} />
                                    <Row k="Country / language" v={`${profile.country} · ${profile.language_label || profile.language}`} />
                                    <Row k="Registered" v={formatDate(profile.created_at)} />
                                </dl>
                            </AdminCard>
                            <AdminCard title="Usage" description="Aggregate counts only — no document contents.">
                                <ul className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(usage).map(([key, val]) => (
                                        <li key={key} className="rounded-lg bg-slate-50 px-3 py-2">
                                            <span className="block text-xs uppercase text-slate-400">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-lg font-semibold text-slate-900">{val}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AdminCard>
                            <AdminCard title="Integrations">
                                <ul className="text-sm text-slate-700">
                                    <li>Mollie: {integrations.mollie_configured ? 'Configured' : 'Not configured'}</li>
                                    <li>Postbode: {integrations.postbode_configured ? 'Configured' : 'Not configured'}</li>
                                    <li>Mode: {integrations.integrations_mode}</li>
                                </ul>
                            </AdminCard>
                            <AdminCard title="Subscription">
                                <ul className="text-sm text-slate-700">
                                    <li>Plan: {profile.subscription_plan || 'None'}</li>
                                    <li>Trial ends: {formatDate(profile.trial_ends_at)}</li>
                                    <li>Subscription ends: {formatDate(profile.subscription_ends_at)}</li>
                                    <li>Valid: {profile.subscription_valid ? 'Yes' : 'No'}</li>
                                </ul>
                            </AdminCard>
                        </div>
                    )}

                    {tab === 'status' && (
                        <AdminCard title="Status & restrictions">
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={statusAction}
                                    onChange={(e) => setStatusAction(e.target.value)}
                                    className={selectClass}
                                >
                                    {statusActions.map((a) => (
                                        <option key={a} value={a}>
                                            {a}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    value={statusReason}
                                    onChange={(e) => setStatusReason(e.target.value)}
                                    placeholder="Reason for audit log"
                                    className={`${inputClass} min-w-[200px] flex-1`}
                                />
                                <AdminButton type="button" onClick={postStatus}>
                                    Apply
                                </AdminButton>
                            </div>
                            <table className="mt-6 w-full text-left text-sm">
                                <thead className="text-[11px] uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="py-2">When</th>
                                        <th className="py-2">Action</th>
                                        <th className="py-2">By</th>
                                        <th className="py-2">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {statusHistory.map((row) => (
                                        <tr key={row.id}>
                                            <td className="py-2">{formatDate(row.created_at)}</td>
                                            <td className="py-2 font-mono text-xs">{row.action}</td>
                                            <td className="py-2">{row.actor || '—'}</td>
                                            <td className="py-2 text-slate-600">{row.reason || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </AdminCard>
                    )}

                    {tab === 'verification' && (
                        <AdminCard title="Verification">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    verificationForm.patch(`/admin/companies/${profile.id}/verification`, { preserveScroll: true });
                                }}
                                className="space-y-3"
                            >
                                <select
                                    value={verificationForm.data.status}
                                    onChange={(e) => verificationForm.setData('status', e.target.value)}
                                    className={selectClass}
                                >
                                    {['not_required', 'pending', 'verified', 'rejected'].map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                <textarea
                                    value={verificationForm.data.notes}
                                    onChange={(e) => verificationForm.setData('notes', e.target.value)}
                                    rows={4}
                                    placeholder="Review notes"
                                    className={inputClass}
                                />
                                <p className="text-xs text-slate-500">Legal documents on file (metadata only):</p>
                                <ul className="text-sm text-slate-700">
                                    {(profile.legal_documents || []).map((doc) => (
                                        <li key={doc.id}>
                                            {doc.type}: {doc.name} ({formatDate(doc.uploaded_at)})
                                        </li>
                                    ))}
                                    {(profile.legal_documents || []).length === 0 && <li className="text-slate-400">None uploaded.</li>}
                                </ul>
                                <AdminButton type="submit">Save verification</AdminButton>
                            </form>
                        </AdminCard>
                    )}

                    {tab === 'overrides' && (
                        <AdminCard title="Feature overrides">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    overrideForm.post(`/admin/companies/${profile.id}/overrides`, {
                                        preserveScroll: true,
                                        onSuccess: () => overrideForm.reset('reason', 'expires_at'),
                                    });
                                }}
                                className="grid gap-3 sm:grid-cols-2"
                            >
                                <select
                                    value={overrideForm.data.capability_key}
                                    onChange={(e) => overrideForm.setData('capability_key', e.target.value)}
                                    className={`${selectClass} sm:col-span-2`}
                                >
                                    {capabilityOptions.map((c) => (
                                        <option key={c.key} value={c.key}>
                                            {c.key}
                                        </option>
                                    ))}
                                </select>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={overrideForm.data.granted}
                                        onChange={(e) => overrideForm.setData('granted', e.target.checked)}
                                    />
                                    Grant capability
                                </label>
                                <input
                                    type="date"
                                    value={overrideForm.data.expires_at}
                                    onChange={(e) => overrideForm.setData('expires_at', e.target.value)}
                                    className={inputClass}
                                />
                                <input
                                    value={overrideForm.data.reason}
                                    onChange={(e) => overrideForm.setData('reason', e.target.value)}
                                    placeholder="Justification"
                                    className={`${inputClass} sm:col-span-2`}
                                />
                                <AdminButton type="submit" className="sm:col-span-2">
                                    Add override
                                </AdminButton>
                            </form>
                            <ul className="mt-6 space-y-2 text-sm">
                                {overrides.map((row) => (
                                    <li key={row.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                                        <span>
                                            <span className="font-mono text-xs">{row.capability_key}</span> —{' '}
                                            {row.granted ? 'grant' : 'deny'}
                                            {!row.active && ' (expired)'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => router.delete(`/admin/companies/${profile.id}/overrides/${row.id}`)}
                                            className="text-xs text-rose-600"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </AdminCard>
                    )}

                    {tab === 'export' && (
                        <AdminCard title="Data export">
                            <AdminButton type="button" onClick={() => router.post(`/admin/companies/${profile.id}/exports`)}>
                                Generate JSON export
                            </AdminButton>
                            <p className="mt-2 text-xs text-slate-500">Structured metadata and counts — no invoice PDFs or line items.</p>
                            <ul className="mt-4 space-y-2 text-sm">
                                {exportRows.map((row) => (
                                    <li key={row.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                                        <span>
                                            {row.format.toUpperCase()} · {row.status} · {formatDate(row.created_at)}
                                        </span>
                                        {row.status === 'ready' && (
                                            <a
                                                href={`/admin/companies/${profile.id}/exports/${row.id}/download`}
                                                className="text-indigo-600"
                                            >
                                                Download
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </AdminCard>
                    )}

                    {tab === 'retention' && (
                        <AdminCard title="Deletion & retention">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    deletionForm.post(`/admin/companies/${profile.id}/deletion-requests`, { preserveScroll: true });
                                }}
                                className="space-y-3"
                            >
                                <textarea
                                    value={deletionForm.data.reason}
                                    onChange={(e) => deletionForm.setData('reason', e.target.value)}
                                    placeholder="Deletion request reason"
                                    rows={2}
                                    className={inputClass}
                                />
                                <input
                                    type="number"
                                    min={0}
                                    value={deletionForm.data.retention_days}
                                    onChange={(e) => deletionForm.setData('retention_days', Number(e.target.value))}
                                    className={`${inputClass} w-40`}
                                />
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={deletionForm.data.legal_hold}
                                        onChange={(e) => deletionForm.setData('legal_hold', e.target.checked)}
                                    />
                                    Legal hold
                                </label>
                                <AdminButton type="submit" variant="danger">
                                    Create deletion request
                                </AdminButton>
                            </form>
                            <ul className="mt-6 space-y-3 text-sm">
                                {deletionRequests.map((req) => (
                                    <li key={req.id} className="rounded-xl border border-slate-200 p-3">
                                        <div className="font-medium">{req.status}</div>
                                        <div className="text-slate-600">{req.reason}</div>
                                        <div className="mt-1 text-xs text-slate-400">
                                            Retention until {req.retention_until || '—'}
                                            {req.legal_hold ? ' · legal hold' : ''}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {['pending', 'legal_hold', 'scheduled', 'completed', 'cancelled'].map((st) => (
                                                <button
                                                    key={st}
                                                    type="button"
                                                    onClick={() =>
                                                        router.patch(`/admin/companies/${profile.id}/deletion-requests/${req.id}`, {
                                                            status: st,
                                                            legal_hold: req.legal_hold,
                                                        })
                                                    }
                                                    className="rounded border border-slate-200 px-2 py-0.5 text-xs"
                                                >
                                                    Mark {st}
                                                </button>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </AdminCard>
                    )}

                    {tab === 'timeline' && (
                        <AdminCard title="Activity timeline" description="Status changes, payments, logins, and admin actions.">
                            <AdminTimeline events={timeline} formatDate={formatDate} />
                        </AdminCard>
                    )}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}

function Row({ k, v }) {
    return (
        <div className="flex gap-4">
            <dt className="w-32 shrink-0 text-slate-500">{k}</dt>
            <dd className="text-slate-800">{v}</dd>
        </div>
    );
}
