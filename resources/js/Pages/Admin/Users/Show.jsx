import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminCard,
    AdminHeader,
    AdminLinkButton,
    AdminPage,
    inputClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

export default function AdminUsersShow({
    profile,
    allRoles = [],
    activity = [],
    security = [],
    sessions = [],
}) {
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');

    const rolesForm = useForm({
        role_ids: profile.roles.map((role) => role.id),
    });

    const passwordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const toggleActive = () => {
        if (profile.is_active && !suspendOpen) {
            setSuspendOpen(true);
            return;
        }
        router.post(
            `/admin/users/${profile.id}/toggle-active`,
            { reason: suspendReason || undefined },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSuspendOpen(false);
                    setSuspendReason('');
                },
            },
        );
    };

    const postAction = (url) => {
        router.post(url, {}, { preserveScroll: true });
    };

    const saveRoles = (event) => {
        event.preventDefault();
        rolesForm.post(`/admin/users/${profile.id}/roles`, { preserveScroll: true });
    };

    const savePassword = (event) => {
        event.preventDefault();
        passwordForm.post(`/admin/users/${profile.id}/reset-password`, {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setPasswordOpen(false);
            },
        });
    };

    return (
        <AdminLayout title={profile.name}>
            <AdminPage>
                <AdminHeader
                    eyebrow="Directory"
                    title={profile.name}
                    description={`${profile.email} · ID ${profile.id}`}
                    backHref="/admin/users"
                    backLabel="Users"
                    actions={
                        <>
                            <AdminLinkButton href={`/admin/users/${profile.id}/edit`} variant="secondary">
                                Edit profile
                            </AdminLinkButton>
                            <AdminButton
                                variant={profile.is_active ? 'danger' : 'accent'}
                                onClick={() => (profile.is_active ? setSuspendOpen(true) : toggleActive())}
                            >
                                {profile.is_active ? 'Suspend' : 'Reactivate'}
                            </AdminButton>
                        </>
                    }
                />
                <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 lg:px-8">
                    <AdminBadge tone={profile.is_active ? 'success' : 'danger'}>{profile.is_active ? 'Active' : 'Suspended'}</AdminBadge>
                    <AdminBadge tone={profile.email_verified_at ? 'success' : 'warning'}>
                        {profile.email_verified_at ? 'Email verified' : 'Email not verified'}
                    </AdminBadge>
                </div>

                {suspendOpen && (
                    <div className="border-b border-rose-100 bg-rose-50/80 px-4 py-4 lg:px-6">
                        <p className="text-sm font-medium text-rose-900">Suspend this account?</p>
                        <p className="mt-1 text-xs text-rose-700">The user will be signed out on their next request. Active sessions can be revoked below.</p>
                        <textarea
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            placeholder="Reason for audit log (optional)"
                            rows={2}
                            className="mt-3 w-full max-w-xl rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-300"
                        />
                        <div className="mt-3 flex gap-2">
                            <button
                                type="button"
                                onClick={toggleActive}
                                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                            >
                                Confirm suspend
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSuspendOpen(false);
                                    setSuspendReason('');
                                }}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <AdminBody className="grid gap-6 lg:grid-cols-3">
                    <AdminCard title="Account" className="lg:col-span-1">
                        <dl className="mt-4 space-y-3 text-sm">
                            <Row label="Joined" value={formatDate(profile.created_at)} />
                            <Row label="Last profile update" value={formatDate(profile.updated_at)} />
                            <Row
                                label="Email verified"
                                value={profile.email_verified_at ? formatDate(profile.email_verified_at) : 'No'}
                            />
                            <Row
                                label="Billing reminders"
                                value={profile.billing_reminders_enabled ? 'Enabled' : 'Disabled'}
                            />
                        </dl>
                    </AdminCard>

                    <AdminCard title="Account actions" className="lg:col-span-2">
                        <div className="mt-4 flex flex-wrap gap-2">
                            {profile.email_verified_at ? (
                                <ActionButton
                                    label="Mark email unverified"
                                    hint="Forces re-verification on next sensitive action"
                                    onClick={() => postAction(`/admin/users/${profile.id}/unverify-email`)}
                                    variant="muted"
                                />
                            ) : (
                                <ActionButton
                                    label="Mark email verified"
                                    onClick={() => postAction(`/admin/users/${profile.id}/verify-email`)}
                                />
                            )}
                            <ActionButton
                                label="Send password reset email"
                                onClick={() => postAction(`/admin/users/${profile.id}/send-password-reset`)}
                            />
                            <ActionButton
                                label={profile.billing_reminders_enabled ? 'Disable billing reminders' : 'Enable billing reminders'}
                                onClick={() => postAction(`/admin/users/${profile.id}/toggle-billing-reminders`)}
                                variant="muted"
                            />
                            <ActionButton
                                label="Revoke all sessions"
                                hint={`${sessions.length} active session(s) listed below`}
                                onClick={() => {
                                    if (window.confirm('Sign this user out everywhere?')) {
                                        postAction(`/admin/users/${profile.id}/revoke-sessions`);
                                    }
                                }}
                                variant="danger"
                            />
                        </div>

                        <div className="mt-6 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setPasswordOpen((open) => !open)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                                {passwordOpen ? 'Hide' : 'Set new password manually'}
                            </button>
                            {passwordOpen && (
                                <form onSubmit={savePassword} className="mt-3 grid max-w-md gap-3">
                                    <label className="block text-sm">
                                        <span className="mb-1 font-medium text-slate-700">New password</span>
                                        <input
                                            type="password"
                                            autoComplete="new-password"
                                            value={passwordForm.data.password}
                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                        />
                                        {passwordForm.errors.password && (
                                            <span className="text-xs text-rose-600">{passwordForm.errors.password}</span>
                                        )}
                                    </label>
                                    <label className="block text-sm">
                                        <span className="mb-1 font-medium text-slate-700">Confirm password</span>
                                        <input
                                            type="password"
                                            autoComplete="new-password"
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="w-fit rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                    >
                                        Update password
                                    </button>
                                </form>
                            )}
                        </div>
                    </AdminCard>

                    <AdminCard title="Roles">
                        <form onSubmit={saveRoles} className="mt-4 space-y-2">
                            <RolePicker
                                allRoles={allRoles}
                                selected={rolesForm.data.role_ids}
                                onChange={(roleIds) => rolesForm.setData('role_ids', roleIds)}
                            />
                            <AdminButton type="submit" disabled={rolesForm.processing} className="mt-3">
                                Save roles
                            </AdminButton>
                        </form>
                    </AdminCard>

                    <AdminCard title="Effective permissions" description="Derived from assigned roles." className="lg:col-span-2">
                        <div className="flex flex-wrap gap-1.5">
                            {(profile.permissions || []).length === 0 && (
                                <span className="text-sm text-slate-400">No permissions from roles.</span>
                            )}
                            {(profile.permissions || []).map((name) => (
                                <span
                                    key={name}
                                    className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs text-slate-700"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    </AdminCard>

                    <AdminCard title="Companies" className="lg:col-span-3">
                        <ul className="mt-3 space-y-2 text-sm">
                            {profile.companies.length === 0 && <li className="text-slate-400">No companies linked.</li>}
                            {profile.companies.map((company) => (
                                <li
                                    key={company.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5"
                                >
                                    <div>
                                        <Link href={`/admin/companies/${company.id}`} className="font-medium text-indigo-700 hover:underline">
                                            {company.name}
                                        </Link>
                                        <span className="ml-2 text-xs text-slate-400">#{company.id}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                                            {company.approval_status || '—'}
                                        </span>
                                        <span className="text-slate-500">{company.subscription_plan || 'No plan'}</span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 font-medium ${
                                                company.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                            }`}
                                        >
                                            {company.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </AdminCard>

                    <AdminCard title="Active sessions" className="lg:col-span-3">
                        {sessions.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-400">No session records (user may be offline).</p>
                        ) : (
                            <div className="mt-3 overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="py-2 pr-4">Last seen</th>
                                            <th className="py-2 pr-4">IP</th>
                                            <th className="py-2">User agent</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sessions.map((session) => (
                                            <tr key={session.id}>
                                                <td className="py-2 pr-4 text-slate-600">{formatDate(session.last_activity)}</td>
                                                <td className="py-2 pr-4 font-mono text-xs">{session.ip_address || '—'}</td>
                                                <td className="py-2 text-xs text-slate-500">{session.user_agent || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </AdminCard>

                    <AdminCard title="Recent activity" className="lg:col-span-2">
                        <LogTable rows={activity} columns={['action', 'outcome', 'ip_address', 'created_at']} />
                    </AdminCard>

                    <AdminCard title="Security events">
                        <LogTable rows={security} columns={['event_type', 'outcome', 'ip_address', 'created_at']} />
                    </AdminCard>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium text-slate-900">{value}</dd>
        </div>
    );
}

function ActionButton({ label, hint, onClick, variant = 'default' }) {
    const styles =
        variant === 'danger'
            ? 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
            : variant === 'muted'
              ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              : 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100';

    return (
        <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-2 text-left text-sm transition ${styles}`}>
            <span className="font-medium">{label}</span>
            {hint && <span className="mt-0.5 block text-xs opacity-80">{hint}</span>}
        </button>
    );
}

function RolePicker({ allRoles, selected, onChange }) {
    const toggle = (id) => {
        if (selected.includes(id)) {
            onChange(selected.filter((value) => value !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <>
            {allRoles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={selected.includes(role.id)}
                        onChange={() => toggle(role.id)}
                        className="rounded border-slate-300 text-indigo-600"
                    />
                    {role.name}
                </label>
            ))}
        </>
    );
}

function LogTable({ rows, columns }) {
    if (!rows.length) {
        return <p className="mt-3 text-sm text-slate-400">No entries yet.</p>;
    }

    return (
        <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                    <tr>
                        {columns.map((col) => (
                            <th key={col} className="px-2 py-2 font-semibold">
                                {col.replace('_', ' ')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                        <tr key={row.id}>
                            {columns.map((col) => (
                                <td key={col} className="px-2 py-2 text-slate-700">
                                    {col === 'created_at' ? formatDate(row[col]) : row[col] || '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
