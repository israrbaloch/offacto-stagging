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

function invoiceType(invoice) {
    const number = String(invoice.invoice_number || '');
    if (number.toUpperCase().startsWith('CRN') || Number(invoice.total) < 0) {
        return 'credit';
    }
    return 'standard';
}

function statusMeta(invoice) {
    if (invoice.is_overdue || (invoice.due_date && invoice.payment_status !== 'paid' && new Date(invoice.due_date) < new Date())) {
        return { label: t('invoices.overdue'), tone: 'overdue' };
    }
    const payment = String(invoice.payment_status || '').toLowerCase();
    if (payment === 'paid') return { label: t('invoices.paid'), tone: 'paid' };
    const name = String(invoice.status_relation?.name || 'Draft');
    const key = name.toLowerCase();
    if (key === 'sent') return { label: t('invoices.sent'), tone: 'sent' };
    if (key === 'applied') return { label: t('invoices.applied'), tone: 'paid' };
    return { label: name, tone: 'draft' };
}

function StatusPill({ tone, children }) {
    const styles = {
        paid: 'bg-emerald-50 text-emerald-700',
        overdue: 'bg-rose-50 text-rose-700',
        sent: 'bg-indigo-50 text-indigo-700',
        draft: 'bg-slate-100 text-slate-600',
        credit: 'bg-slate-100 text-slate-700',
        recurring: 'bg-indigo-50 text-indigo-600',
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

function TypePill({ type }) {
    const tone = type === 'credit' ? 'credit' : type === 'recurring' ? 'recurring' : 'draft';
    const label = type === 'credit' ? t('invoices.credit_note') : t('invoices.standard');
    return <StatusPill tone={tone}>{label}</StatusPill>;
}

function StatIcon({ name }) {
    const common = { className: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: '1.7' };
    if (name === 'wallet') {
        return (
            <svg {...common}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
                <path strokeLinecap="round" d="M3 8l2.4-3.2A2 2 0 0 1 7 4h10a2 2 0 0 1 1.6.8L21 8" />
                <circle cx="16.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
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
                <path strokeLinecap="round" strokeLinejoin="round" d="m5 8 4 4" />
            </svg>
        );
    }
    return (
        <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 15 22l-4-9-9-4 20-7z" />
        </svg>
    );
}

export default function Index({ invoices, stats = {} }) {
    const rows = invoices?.data || [];
    const total = invoices?.total ?? rows.length;
    const [filtersOpen, setFiltersOpen] = useState(false);

    return (
        <AuthenticatedLayout title={t('invoices.title')}>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t('invoices.title')}</h1>
                        <p className="mt-1 text-sm text-slate-500">{t('invoices.subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                        >
                            {t('offers.export')}
                        </button>
                        <Link
                            href="/invoices/create"
                            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            {t('invoices.new')}
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <StatIcon name="wallet" />
                            </span>
                        </div>
                        <div className="mt-4 text-sm text-slate-500">{t('invoices.outstanding')}</div>
                        <div className="mt-1 font-serif text-2xl font-semibold text-slate-900">{money(stats.outstanding)}</div>
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-500">
                            <StatIcon name="alert" />
                        </span>
                        <div className="mt-4 text-sm font-medium text-rose-600">{t('invoices.overdue')}</div>
                        <div className="mt-1 font-serif text-2xl font-semibold text-slate-900">{money(stats.overdue)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <StatIcon name="check" />
                        </span>
                        <div className="mt-4 text-sm text-slate-500">{t('invoices.paid_ytd')}</div>
                        <div className="mt-1 font-serif text-2xl font-semibold text-slate-900">{money(stats.paid_ytd ?? stats.paid)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <StatIcon name="send" />
                        </span>
                        <div className="mt-4 text-sm text-slate-500">{t('invoices.peppol')}</div>
                        <div className="mt-1 font-serif text-2xl font-semibold text-slate-900">
                            {stats.peppol_sent ?? 0} <span className="text-base font-sans font-medium text-slate-400">{t('invoices.invoices_unit')}</span>
                        </div>
                    </div>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-slate-900">{t('invoices.recent')}</h2>
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
                                { label: t('invoices.paid'), params: { payment_status: 'paid' } },
                                { label: t('invoices.unpaid'), params: { payment_status: 'unpaid' } },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => router.get('/invoices', item.params, { preserveState: true })}
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
                                    <th className="px-5 py-3 font-medium sm:px-6">{t('invoices.number')}</th>
                                    <th className="px-3 py-3 font-medium">{t('dashboard.customer')}</th>
                                    <th className="px-3 py-3 font-medium">{t('invoices.issue_date')}</th>
                                    <th className="px-3 py-3 font-medium">{t('invoices.due_date')}</th>
                                    <th className="px-3 py-3 font-medium">{t('common.type')}</th>
                                    <th className="px-3 py-3 font-medium">{t('common.status')}</th>
                                    <th className="px-5 py-3 text-right font-medium sm:px-6">{t('offers.amount')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                                            {t('invoices.empty')}
                                        </td>
                                    </tr>
                                )}
                                {rows.map((invoice) => {
                                    const status = statusMeta(invoice);
                                    const overdueDue = status.tone === 'overdue';
                                    const type = invoiceType(invoice);
                                    return (
                                        <tr key={invoice.id} className="border-b border-slate-50 last:border-0">
                                            <td className="px-5 py-4 sm:px-6">
                                                <Link
                                                    href={String(invoice.status_relation?.name || 'draft').toLowerCase() === 'draft' ? `/invoices/${invoice.id}/edit` : `/invoices/${invoice.id}`}
                                                    className="font-medium text-indigo-600 hover:text-indigo-700"
                                                >
                                                    {invoice.invoice_number || t('offers.untitled')}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                                                        {initials(invoice.customer)}
                                                    </span>
                                                    <span className="truncate font-medium text-slate-800">{invoice.customer ? displayName(invoice.customer) : t('offers.untitled')}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-slate-500">{prettyDate(invoice.invoice_date)}</td>
                                            <td className={`px-3 py-4 ${overdueDue ? 'font-medium text-rose-600' : 'text-slate-500'}`}>
                                                {prettyDate(invoice.due_date)}
                                            </td>
                                            <td className="px-3 py-4">
                                                <TypePill type={type} />
                                            </td>
                                            <td className="px-3 py-4">
                                                <StatusPill tone={status.tone}>{status.label}</StatusPill>
                                            </td>
                                            <td className="px-5 py-4 text-right font-serif text-slate-900 sm:px-6">
                                                {money(invoice.total)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-4 sm:px-6">
                        <Pagination links={invoices?.links || []} />
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
