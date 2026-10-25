import { router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import { t } from '../lib/i18n';

const ROLE_OPTIONS = [
    { value: 'staff', labelKey: 'company_settings.team_role_staff' },
    { value: 'accountant', labelKey: 'company_settings.team_role_accountant' },
];

function roleLabelKey(role) {
    return `company_settings.team_role_${role}`;
}

function permissionsLabelKey(role) {
    return `company_settings.team_permissions_${role}`;
}

function memberName(row) {
    return [row.first_name, row.surname].filter(Boolean).join(' ').trim() || row.email;
}

export default function CompanySettingsTeamPanel({ team = {}, settingsBasePath }) {
    const owner = team.owner;
    const members = team.members || [];
    const canManage = !!team.can_manage;

    const rows = useMemo(() => (owner ? [owner, ...members] : members), [owner, members]);

    const [inviteOpen, setInviteOpen] = useState(false);

    const inviteForm = useForm({
        first_name: '',
        surname: '',
        email: '',
        role: 'staff',
    });

    useEffect(() => {
        if (!inviteOpen) {
            return undefined;
        }
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setInviteOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [inviteOpen]);

    const sendInvite = (e) => {
        e.preventDefault();
        inviteForm.post(`${settingsBasePath}/team/invites`, {
            preserveScroll: true,
            onSuccess: () => {
                setInviteOpen(false);
                inviteForm.reset();
            },
        });
    };

    const updateRole = (memberId, role) => {
        router.patch(`${settingsBasePath}/team/members/${memberId}`, { role }, { preserveScroll: true });
    };

    const removeMember = (memberId) => {
        router.delete(`${settingsBasePath}/team/members/${memberId}`, { preserveScroll: true });
    };

    return (
        <>
            <div className="offacto-dash-card offacto-settings-card offacto-settings-team-card">
                <div className="offacto-dash-card-head offacto-settings-team-head">
                    <h3>{t('company_settings.nav_team')}</h3>
                    {canManage ? (
                        <button type="button" className="offacto-btn-p" onClick={() => setInviteOpen(true)}>
                            <Icon name="plus" />
                            {t('company_settings.team_invite')}
                        </button>
                    ) : null}
                </div>

                <div className="offacto-dash-card-body offacto-settings-team-table-wrap">
                    <table className="offacto-settings-team-table">
                        <thead>
                            <tr>
                                <th>{t('company_settings.team_col_name')}</th>
                                <th>{t('company_settings.team_col_role')}</th>
                                <th>{t('company_settings.team_col_permissions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id}>
                                    <td>
                                        <div className="offacto-settings-team-person">
                                            <span className="offacto-settings-team-av">{row.initials}</span>
                                            <span>
                                                <b>{memberName(row)}</b>
                                                <small>{row.email}</small>
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        {row.is_owner ? (
                                            <span className="offacto-settings-team-role">{t(roleLabelKey(row.role))}</span>
                                        ) : canManage ? (
                                            <select
                                                className="offacto-settings-team-role-select"
                                                value={row.role}
                                                onChange={(e) => updateRole(row.id, e.target.value)}
                                            >
                                                {ROLE_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {t(opt.labelKey)}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="offacto-settings-team-role">{t(roleLabelKey(row.role))}</span>
                                        )}
                                    </td>
                                    <td className="offacto-settings-team-perms">
                                        {t(permissionsLabelKey(row.role))}
                                        {!row.is_owner && row.pending ? (
                                            <span className="offacto-settings-team-pending">{t('company_settings.team_invite_pending')}</span>
                                        ) : null}
                                        {!row.is_owner && canManage ? (
                                            <button type="button" className="offacto-settings-team-remove" onClick={() => removeMember(row.id)}>
                                                {t('common.delete')}
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <button
                type="button"
                className={`offacto-drawer-scrim${inviteOpen ? ' on' : ''}`}
                aria-label={t('common.close')}
                aria-hidden={!inviteOpen}
                tabIndex={inviteOpen ? 0 : -1}
                onClick={() => setInviteOpen(false)}
            />
            <aside
                className={`offacto-drawer offacto-customer-drawer${inviteOpen ? ' on' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!inviteOpen}
                aria-labelledby="team-invite-title"
            >
                <div className="offacto-drawer-head">
                    <div className="offacto-drawer-who">
                        <div>
                            <h3 id="team-invite-title">{t('company_settings.team_invite_title')}</h3>
                            <small>{t('company_settings.team_invite_desc')}</small>
                        </div>
                    </div>
                    <button type="button" className="offacto-drawer-icobtn" onClick={() => setInviteOpen(false)} aria-label={t('common.close')}>
                        <Icon name="x" />
                    </button>
                </div>
                <form onSubmit={sendInvite} className="offacto-drawer-form">
                    <div className="offacto-drawer-body">
                        <div className="offacto-drawer-fg2">
                            <div className="offacto-drawer-field">
                                <label className="offacto-drawer-lbl" htmlFor="team-invite-first">
                                    {t('customers.first_name')}
                                </label>
                                <input
                                    id="team-invite-first"
                                    className="offacto-drawer-inp"
                                    value={inviteForm.data.first_name}
                                    onChange={(e) => inviteForm.setData('first_name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="offacto-drawer-field">
                                <label className="offacto-drawer-lbl" htmlFor="team-invite-surname">
                                    {t('customers.surname')}
                                </label>
                                <input
                                    id="team-invite-surname"
                                    className="offacto-drawer-inp"
                                    value={inviteForm.data.surname}
                                    onChange={(e) => inviteForm.setData('surname', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl" htmlFor="team-invite-email">
                                {t('profile.email')}
                            </label>
                            <input
                                id="team-invite-email"
                                type="email"
                                className="offacto-drawer-inp"
                                value={inviteForm.data.email}
                                onChange={(e) => inviteForm.setData('email', e.target.value)}
                                required
                            />
                            {inviteForm.errors.email ? <p className="offacto-drawer-hint bad">{inviteForm.errors.email}</p> : null}
                        </div>
                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl" htmlFor="team-invite-role">
                                {t('company_settings.team_col_role')}
                            </label>
                            <select
                                id="team-invite-role"
                                className="offacto-drawer-inp"
                                value={inviteForm.data.role}
                                onChange={(e) => inviteForm.setData('role', e.target.value)}
                            >
                                {ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {t(opt.labelKey)}
                                    </option>
                                ))}
                            </select>
                            <p className="offacto-drawer-hint">{t(permissionsLabelKey(inviteForm.data.role))}</p>
                        </div>
                    </div>
                    <div className="offacto-drawer-foot">
                        <div className="offacto-drawer-foot-spacer" />
                        <button type="button" className="offacto-drawer-btn" onClick={() => setInviteOpen(false)}>
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="offacto-drawer-btn primary" disabled={inviteForm.processing}>
                            {inviteForm.processing ? t('common.saving') : t('company_settings.team_send_invite')}
                        </button>
                    </div>
                </form>
            </aside>
        </>
    );
}
