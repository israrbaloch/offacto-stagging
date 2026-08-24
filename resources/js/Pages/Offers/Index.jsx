import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Icon from '../../Components/Icon';
import Pagination from '../../Components/Pagination';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { localeTag, t } from '../../lib/i18n';
import { customerName, money } from '../../lib/utils';

function prettyDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(localeTag(), { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(customer) {
    const source = customer?.org_name || [customer?.first_name, customer?.surname].filter(Boolean).join(' ');
    if (!source) return '—';
    return source
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

function displayName(customer) {
    if (!customer) return '—';
    return customer.org_name || customerName(customer);
}

function statusMeta(offer) {
    const name = String(offer.status_relation?.name || 'Draft');
    const key = name.toLowerCase();
    const expired =
        offer.valid_until &&
        new Date(offer.valid_until) < new Date() &&
        ['draft', 'sent', 'pending', 'open'].includes(key);

    if (expired) return { label: t('offers.expired'), tone: 'overdue' };
    if (key === 'accepted') return { label: t('offers.accepted'), tone: 'paid' };
    if (key === 'invoiced') return { label: t('offers.invoiced'), tone: 'sent' };
    if (key === 'sent' || key === 'pending') return { label: name, tone: 'sent' };
    if (key === 'rejected' || key === 'declined') return { label: name, tone: 'overdue' };
    return { label: name, tone: 'draft' };
}

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

function StatIcon({ name }) {
    const common = { className: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: '1.7' };
    if (name === 'doc') {
        return (
            <svg {...common}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
            </svg>
        );
    }
    if (name === 'alert') {
        return (
            <svg {...common}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 4.7 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.7a2 2 0 0 0-3.4 0z" />
            </svg>
        );
    }
    if (name === 'check') {
        return (
            <svg {...common}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
            </svg>
        );
    }
    return (
        <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 2h16v20l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
            <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
    );
}

export default function Index({ offers, stats = {} }) {
    const rows = offers?.data || [];
    const total = offers?.total ?? rows.length;
    const [filtersOpen, setFiltersOpen] = useState(false);

    return (
        <AuthenticatedLayout title={t('offers.title')}>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t('offers.title')}</h1>
                        <p className="mt-1 text-sm text-slate-500">{t('offers.subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                        >
                            {t('offers.export')}
                        </button>
                        <Link
                            href="/offers/create"
                            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            {t('offers.new')}
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <StatIcon name="doc" />
                        </span>
                        <div className="mt-4 text-sm text-slate-500">{t('offers.open')}</div>
                        <div className="mt-1 font-serif text-2xl font-semibold text-slate-900">{money(stats.open)}</div>
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-500">
                            <StatIcon name="alert" />
                        </span>
                        <div className="mt-4 text-sm font-medium text-rose-600">{t('offers.expired')}</div>
                        <div className="mt-1 font-serif text-2xl font-semibold text-slate-900">{money(stats.expired)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <StatIcon name="check" />
                        </span>
                        <div className="mt-4 text-sm text-slate-500">{t('offers.accepted')}</div>
                        <div className="mt-1 font-serif text-2xl font-semibold text-slate-900">{money(stats.accepted)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <StatIcon name="invoice" />
                        </span>
                        <div className="mt-4 text-sm text-slate-500">{t('offers.invoiced')}</div>
                        <div className="mt-1 font-serif text-2xl font-semibold text-slate-900">{money(stats.invoiced)}</div>
                    </div>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-slate-900">{t('offers.recent')}</h2>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{t('common.total_count', { count: total })}</span>
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
                                { label: t('common.all'), params: {} },
                                { label: t('offers.this_year'), params: { date_filter: 'current_year' } },
                                { label: t('offers.this_month'), params: { date_filter: 'current_month' } },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => router.get('/offers', item.params, { preserveState: true })}
                                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left text-sm">
                            <thead>
                                <tr className="border-y border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                                    <th className="px-5 py-3 font-medium sm:px-6">{t('offers.number')}</th>
                                    <th className="px-3 py-3 font-medium">{t('dashboard.customer')}</th>
                                    <th className="px-3 py-3 font-medium">{t('offers.issue_date')}</th>
                                    <th className="px-3 py-3 font-medium">{t('offers.valid_until')}</th>
                                    <th className="px-3 py-3 font-medium">{t('common.type')}</th>
                                    <th className="px-3 py-3 font-medium">{t('common.status')}</th>
                                    <th className="px-5 py-3 text-right font-medium sm:px-6">{t('offers.amount')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                                            {t('offers.empty')}
                                        </td>
                                    </tr>
                                )}
                                {rows.map((offer) => {
                                    const status = statusMeta(offer);
                                    const expiredValid = status.tone === 'overdue' && status.label === 'Expired';
                                    return (
                                        <tr key={offer.id} className="border-b border-slate-50 last:border-0">
                                            <td className="px-5 py-4 sm:px-6">
                                                <Link
                                                    href={String(offer.status_relation?.name || 'draft').toLowerCase() === 'draft' ? `/offers/${offer.id}/edit` : `/offers/${offer.id}`}
                                                    className="font-medium text-indigo-600 hover:text-indigo-700"
                                                >
                                                    {offer.offer_number}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                                                        {initials(offer.customer)}
                                                    </span>
                                                    <span className="truncate font-medium text-slate-800">
                                                        {offer.customer ? displayName(offer.customer) : t('offers.untitled')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-slate-500">{prettyDate(offer.offer_date)}</td>
                                            <td className={`px-3 py-4 ${expiredValid ? 'font-medium text-rose-600' : 'text-slate-500'}`}>
                                                {prettyDate(offer.valid_until)}
                                            </td>
                                            <td className="px-3 py-4">
                                                <StatusPill tone="draft">{t('offers.standard')}</StatusPill>
                                            </td>
                                            <td className="px-3 py-4">
                                                <StatusPill tone={status.tone}>{status.label}</StatusPill>
                                            </td>
                                            <td className="px-5 py-4 text-right font-serif text-slate-900 sm:px-6">
                                                {money(offer.total)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-4 sm:px-6">
                        <Pagination links={offers?.links || []} />
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
