import { Link, usePage } from '@inertiajs/react';
import { CashflowChart, DsoBars, PaymentDonut } from '../Components/DashboardCharts';
import Icon from '../Components/Icon';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { t } from '../lib/i18n';
import { formatDate, money } from '../lib/utils';

function StatusPill({ children, tone }) {
    const styles = {
        action: 'bg-indigo-100 text-indigo-700',
        draft: 'bg-slate-100 text-slate-600',
        sent: 'bg-emerald-100 text-emerald-700',
    };

    return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone] || styles.draft}`}>
            {children}
        </span>
    );
}

function customerLabel(customer) {
    if (!customer) return t('dashboard.no_customer');
    return customer.org_name || [customer.first_name, customer.surname].filter(Boolean).join(' ') || t('dashboard.customer');
}

export default function Dashboard({
    stats = {},
    openOffers = [],
    topCustomers = [],
    awaitingBriefings = [],
    recentResponses = [],
    hasCompany = true,
}) {
    const { activeCompany, auth } = usePage().props;
    const daysLeft = activeCompany?.trial_days_left;

    if (!hasCompany) {
        return (
            <AuthenticatedLayout title={t('dashboard.title')}>
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
                    <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard.no_company_title')}</h1>
                    <p className="mt-2 text-sm text-slate-500">{t('dashboard.no_company_body')}</p>
                    <Link href="/companies/create" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">
                        {t('dashboard.add_company')}
                    </Link>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout title={t('dashboard.title')}>
            <div className="space-y-6">
                <section className="flex flex-col gap-4 rounded-3xl bg-indigo-50 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div>
                        <div className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-400">
                            {activeCompany?.company_name || t('dashboard.company_hub')}
                            {auth?.user?.is_admin
                                ? ''
                                : activeCompany?.trial_expired
                                    ? ` · ${t('dashboard.trial_ended')}`
                                    : ` · ${t('dashboard.trial_left', { days: daysLeft ?? 0 })}`}
                        </div>
                        <div className="mt-2 font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                            {money(stats.openOffersTotal)}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{t('dashboard.open_quotes')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/customers/create" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800">
                            {t('dashboard.new_customer')}
                        </Link>
                        <Link href="/briefings/create" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800">
                            {t('dashboard.new_briefing')}
                        </Link>
                        <Link
                            href="/offers/create"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            {t('dashboard.create_quotation')}
                        </Link>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.briefing_activity')}</h2>
                        </div>
                        <ul className="space-y-3">
                            {awaitingBriefings.length === 0 && recentResponses.length === 0 && (
                                <li className="text-sm text-slate-400">{t('dashboard.no_briefing')}</li>
                            )}
                            {awaitingBriefings.map((briefing) => (
                                <li key={`b-${briefing.id}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-slate-900">{briefing.title}</div>
                                        <div className="truncate text-sm text-slate-400">
                                            {t('dashboard.awaiting', { name: customerLabel(briefing.customer) })}
                                        </div>
                                    </div>
                                    <StatusPill tone="action">{t('dashboard.active')}</StatusPill>
                                </li>
                            ))}
                            {recentResponses.map((response) => (
                                <li key={`r-${response.id}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-slate-900">{response.briefing?.title || t('dashboard.response')}</div>
                                        <div className="truncate text-sm text-slate-400">
                                            {response.offer_id ? t('dashboard.review_quote', { number: response.offer?.offer_number || response.offer_id }) : t('dashboard.response_received')}
                                        </div>
                                    </div>
                                    <StatusPill tone={response.offer_id ? 'draft' : 'sent'}>{response.offer_id ? t('dashboard.review') : t('dashboard.new')}</StatusPill>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-5 text-center">
                            <Link href="/briefings" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                {t('dashboard.view_briefings')}
                            </Link>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.open_quotations')}</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[460px] text-left text-sm">
                                <thead>
                                    <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                                        <th className="pb-3 font-medium">{t('dashboard.customer')}</th>
                                        <th className="pb-3 font-medium">{t('dashboard.date')}</th>
                                        <th className="pb-3 font-medium">{t('common.status')}</th>
                                        <th className="pb-3 text-right font-medium">{t('common.total')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {openOffers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-6 text-slate-400">{t('dashboard.no_open')}</td>
                                        </tr>
                                    )}
                                    {openOffers.map((row) => (
                                        <tr key={row.id}>
                                            <td className="py-3 font-medium text-slate-800">
                                                <Link href={`/offers/${row.id}/edit`} className="hover:text-indigo-600">
                                                    {customerLabel(row.customer)}
                                                </Link>
                                            </td>
                                            <td className="py-3 text-slate-500">{formatDate(row.offer_date)}</td>
                                            <td className="py-3">
                                                <StatusPill tone={String(row.status_relation?.name || '').toLowerCase() === 'sent' ? 'sent' : 'draft'}>
                                                    {row.status_relation?.name || t('dashboard.draft')}
                                                </StatusPill>
                                            </td>
                                            <td className="py-3 text-right font-serif text-slate-900">{money(row.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('dashboard.top_customers')}</h2>
                    <ul className="divide-y divide-slate-100">
                        {topCustomers.length === 0 && <li className="py-4 text-sm text-slate-400">{t('dashboard.no_top')}</li>}
                        {topCustomers.map((customer) => (
                            <li key={customer.id} className="flex items-center justify-between py-3 text-sm">
                                <span className="font-medium text-slate-800">{customerLabel(customer)}</span>
                                <span className="font-serif text-slate-900">{money(customer.total_invoiced)}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-medium text-slate-500">{t('dashboard.insights')}</h2>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                    {t('dashboard.ytd')}
                                </div>
                                <div className="mt-2 flex items-end gap-3">
                                    <div className="font-serif text-4xl font-semibold text-slate-900">{money(stats.revenue)}</div>
                                </div>
                                <p className="mt-1 text-xs text-slate-400">{t('dashboard.expenses_net', { expenses: money(stats.expenses), net: money(stats.netResult) })}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <CashflowChart />
                        </div>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-2">
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                {t('dashboard.payment_status')}
                            </div>
                            <div className="mt-6">
                                <PaymentDonut />
                            </div>
                        </section>
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                {t('dashboard.dso')}
                            </div>
                            <div className="mt-8">
                                <DsoBars />
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
