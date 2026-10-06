import { useMemo } from 'react';
import { t } from '../lib/i18n';

const fieldClass =
    'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

function LimitInput({ value, onChange, placeholder }) {
    return (
        <input
            type="number"
            min="0"
            className={fieldClass}
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
        <div className="space-y-8">
            <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('plan_entitlements.section_capabilities')}
                </p>
                <p className="mb-4 text-sm text-slate-500">{t('plan_entitlements.section_capabilities_hint')}</p>
                <div className="space-y-5">
                    {groups.map((group) => (
                        <div key={group.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                                <p className="text-sm font-semibold text-slate-800">{t(group.label_key)}</p>
                                <div className="flex gap-2 text-xs">
                                    <button
                                        type="button"
                                        className="font-medium text-indigo-600 hover:text-indigo-700"
                                        onClick={() => setGroupCapabilities(group, true)}
                                    >
                                        {t('plan_entitlements.select_all')}
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        className="font-medium text-slate-600 hover:text-slate-800"
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
                                        className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-100 px-3 py-2.5 hover:bg-slate-50/80"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
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
            </div>

            <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('plan_entitlements.section_limits')}
                </p>
                <p className="mb-4 text-sm text-slate-500">{t('plan_entitlements.section_limits_hint')}</p>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">{t('plan_entitlements.limit_resource')}</th>
                                <th className="px-4 py-3 font-semibold">{t('plan_entitlements.limit_monthly')}</th>
                                <th className="px-4 py-3 font-semibold">{t('plan_entitlements.limit_total')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
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
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
