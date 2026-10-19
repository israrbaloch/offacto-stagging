import { useMemo } from 'react';
import { AdminSection, AdminTable, inputClass } from './Admin/ui';
import { t } from '../lib/i18n';

function LimitInput({ value, onChange, placeholder }) {
    return (
        <input
            type="number"
            min="0"
            className={inputClass}
            placeholder={placeholder}
            value={value === null || value === undefined ? '' : value}
            onChange={(e) => {
                const raw = e.target.value;
                onChange(raw === '' ? null : Math.max(0, Number(raw)));
            }}
        />
    );
}

export default function PlanEntitlementBuilder({ catalog, entitlements, onChange }) {
    const groups = catalog?.groups ?? [];
    const limitKeys = catalog?.limit_keys ?? [];

    const caps = entitlements?.capabilities ?? {};
    const limits = entitlements?.limits ?? {};

    const setCapability = (key, enabled) => {
        onChange({
            ...entitlements,
            capabilities: { ...caps, [key]: enabled },
        });
    };

    const setGroupCapabilities = (group, enabled) => {
        const next = { ...caps };
        group.capabilities.forEach((c) => {
            next[c.key] = enabled;
        });
        onChange({ ...entitlements, capabilities: next });
    };

    const setLimit = (limitKey, field, value) => {
        onChange({
            ...entitlements,
            limits: {
                ...limits,
                [limitKey]: {
                    monthly: limits[limitKey]?.monthly ?? null,
                    total: limits[limitKey]?.total ?? null,
                    [field]: value,
                },
            },
        });
    };

    const limitRows = useMemo(() => {
        const rows = [];
        groups.forEach((group) => {
            if (group.limit_key && !rows.some((r) => r.key === group.limit_key)) {
                rows.push({ key: group.limit_key, labelKey: group.label_key });
            }
        });
        if (limitKeys.includes('team_users') && !rows.some((r) => r.key === 'team_users')) {
            rows.push({ key: 'team_users', labelKey: 'plan_entitlements.groups.team_users' });
        }
        return rows;
    }, [groups, limitKeys]);

    return (
        <div className="space-y-10">
            <AdminSection title={t('plan_entitlements.section_capabilities')} description={t('plan_entitlements.section_capabilities_hint')}>
                <div className="space-y-4">
                    {groups.map((group) => (
                        <div key={group.id} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                                <p className="text-sm font-semibold text-slate-900">{t(group.label_key)}</p>
                                <div className="flex gap-2 text-xs">
                                    <button
                                        type="button"
                                        className="font-medium text-slate-700 hover:text-slate-900"
                                        onClick={() => setGroupCapabilities(group, true)}
                                    >
                                        {t('plan_entitlements.select_all')}
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        className="font-medium text-slate-500 hover:text-slate-800"
                                        onClick={() => setGroupCapabilities(group, false)}
                                    >
                                        {t('plan_entitlements.clear_all')}
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                {group.capabilities.map((cap) => (
                                    <label
                                        key={cap.key}
                                        className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-slate-200 hover:bg-slate-50/80"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/10"
                                            checked={!!caps[cap.key]}
                                            onChange={(e) => setCapability(cap.key, e.target.checked)}
                                        />
                                        <span className="text-sm text-slate-700">{t(cap.label_key)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </AdminSection>

            <AdminSection title={t('plan_entitlements.section_limits')} description={t('plan_entitlements.section_limits_hint')}>
                <AdminTable columns={[t('plan_entitlements.limit_resource'), t('plan_entitlements.limit_monthly'), t('plan_entitlements.limit_total')]}>
                    {limitRows.map((row) => (
                        <tr key={row.key}>
                            <td className="px-4 py-3 font-medium text-slate-800">{t(row.labelKey)}</td>
                            <td className="px-4 py-3">
                                <LimitInput
                                    value={limits[row.key]?.monthly}
                                    onChange={(v) => setLimit(row.key, 'monthly', v)}
                                    placeholder={t('plan_entitlements.unlimited')}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <LimitInput
                                    value={limits[row.key]?.total}
                                    onChange={(v) => setLimit(row.key, 'total', v)}
                                    placeholder={t('plan_entitlements.unlimited')}
                                />
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            </AdminSection>
        </div>
    );
}
