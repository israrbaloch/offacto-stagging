import { Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { t } from '../../lib/i18n';
import { money } from '../../lib/utils';

function StatusPill({ tone, children }) {
    const styles = {
        paid: 'bg-emerald-50 text-emerald-700',
        overdue: 'bg-rose-50 text-rose-700',
        sent: 'bg-indigo-50 text-indigo-700',
        draft: 'bg-slate-100 text-slate-600',
    };
    const dots = {
        paid: 'bg-emerald-500',
        overdue: 'bg-rose-500',
        sent: 'bg-indigo-500',
        draft: 'bg-slate-400',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone] || styles.draft}`}>
            {dots[tone] && <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />}
            {children}
        </span>
    );
}

function statusTone(name) {
    const key = String(name || '').toLowerCase();
    if (['active', 'approved'].includes(key)) return 'paid';
    if (['inactive', 'rejected'].includes(key)) return 'overdue';
    if (['pending'].includes(key)) return 'sent';
    return 'draft';
}

function StatCard({ label, value, accent, icon = 'wrench' }) {
    return (
        <div className={`rounded-2xl border p-5 ${accent ? 'border-rose-100 bg-rose-50/70' : 'border-slate-200 bg-white'}`}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? 'bg-white text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
                <Icon name={icon} className="h-5 w-5" />
            </span>
            <div className={`mt-4 text-sm ${accent ? 'font-medium text-rose-600' : 'text-slate-500'}`}>{label}</div>
            <div className="mt-1 font-serif text-2xl font-semibold text-slate-900">{value}</div>
        </div>
    );
}

export default function Index({ services = [] }) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filter, setFilter] = useState('all');

    const stats = useMemo(() => {
        const active = services.filter((item) => String(item.status_relation?.name || '').toLowerCase() === 'active').length;
        const pending = services.filter((item) => String(item.status_relation?.name || '').toLowerCase() === 'pending').length;
        const avg = services.length
            ? services.reduce((sum, item) => sum + Number(item.price || 0), 0) / services.length
            : 0;
        return { total: services.length, active, pending, avg };
    }, [services]);

    const rows = services.filter((service) => {
        const name = String(service.status_relation?.name || '').toLowerCase();
        if (filter === 'active') return name === 'active';
        if (filter === 'pending') return name === 'pending';
        return true;
    });

    return (
        <AuthenticatedLayout title={t('services.title')}>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t('services.title')}</h1>
                        <p className="mt-1 text-sm text-slate-500">{t('services.subtitle')}</p>
                    </div>
                    <Link
                        href="/services/create"
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('services.new')}
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label={t('common.total')} value={stats.total} />
                    <StatCard label={t('common.active')} value={stats.active} />
                    <StatCard label={t('common.pending')} value={stats.pending} accent />
                    <StatCard label={t('services.average_price')} value={money(stats.avg)} icon="document" />
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-slate-900">{t('services.catalog')}</h2>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{t('common.total_count', { count: rows.length })}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFiltersOpen((value) => !value)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            {t('common.filter')}
                        </button>
                    </div>

                    {filtersOpen && (
                        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3 sm:px-6">
                            {[
                                { id: 'all', label: t('common.all') },
                                { id: 'active', label: t('common.active') },
                                { id: 'pending', label: t('common.pending') },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFilter(item.id)}
                                    className={`rounded-full border px-3 py-1 text-xs ${
                                        filter === item.id ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead>
                                <tr className="border-y border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                                    <th className="px-5 py-3 font-medium sm:px-6">{t('services.title')}</th>
                                    <th className="px-3 py-3 font-medium">{t('services.unit')}</th>
                                    <th className="px-3 py-3 font-medium">{t('common.status')}</th>
                                    <th className="px-3 py-3 text-right font-medium">{t('services.price')}</th>
                                    <th className="px-5 py-3 text-right font-medium sm:px-6">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                                            {t('services.empty')}
                                        </td>
                                    </tr>
                                )}
                                {rows.map((service) => {
                                    const status = service.status_relation?.name || '—';
                                    return (
                                        <tr key={service.id} className="border-b border-slate-50 last:border-0">
                                            <td className="px-5 py-4 sm:px-6">
                                                <Link href={`/services/${service.id}/edit`} className="font-medium text-indigo-600 hover:text-indigo-700">
                                                    {service.name}
                                                </Link>
                                                {service.description && (
                                                    <div className="mt-0.5 max-w-md truncate text-xs text-slate-400">{service.description}</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-4 text-slate-500">{service.unit || '—'}</td>
                                            <td className="px-3 py-4">
                                                <StatusPill tone={statusTone(status)}>{status}</StatusPill>
                                            </td>
                                            <td className="px-3 py-4 text-right font-serif text-slate-900">{money(service.price)}</td>
                                            <td className="px-5 py-4 text-right sm:px-6">
                                                <Link href={`/services/${service.id}/edit`} className="mr-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                                    {t('common.edit')}
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="text-sm font-medium text-rose-600 hover:text-rose-700"
                                                    onClick={() => {
                                                        if (confirm(t('services.delete_confirm'))) {
                                                            router.delete(`/services/${service.id}`);
                                                        }
                                                    }}
                                                >
                                                    {t('common.delete')}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
