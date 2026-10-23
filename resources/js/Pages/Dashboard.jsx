import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Icon from '../Components/Icon';
import { useUi } from '../context/UiContext';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { AuthDiamond } from '../Layouts/AuthSplitLayout';
import { t } from '../lib/i18n';
import { money } from '../lib/utils';

const PERIODS = ['Q1', 'Q2', 'Q3', 'Q4', 'Y'];
const VAT_DUE = { Q1: '20/04', Q2: '20/07', Q3: '20/10', Q4: '20/01', Y: '—' };

function firstName(name = '') {
    return name.trim().split(/\s+/)[0] || '';
}

function periodLabel(period) {
    const year = new Date().getFullYear();
    if (period === 'Y') {
        return String(year);
    }
    return `${period} ${year}`;
}

function DashboardKpi({ hero, icon, label, value, trend, trendMuted }) {
    return (
        <div className={`offacto-dash-card lift offacto-dash-kpi ${hero ? 'offacto-dash-kpi-hero' : ''}`}>
            <span className="offacto-dash-kpi-corner" aria-hidden="true" />
            <div className="offacto-dash-kpi-ic">
                <Icon name={icon} />
            </div>
            <div className="offacto-dash-kpi-lbl">{label}</div>
            <div className="offacto-dash-kpi-val">{value}</div>
            {trend ? (
                <div className={`offacto-dash-kpi-tr ${trendMuted ? 'offacto-dash-kpi-tr--muted' : ''}`}>{trend}</div>
            ) : null}
        </div>
    );
}

function InvoicedReceivedChart({ labels, invoiced, received }) {
    const max = Math.max(...invoiced, ...received, 1);

    return (
        <div className="offacto-dash-chart">
            {labels.map((label, index) => (
                <div key={`${label}-${index}`} className="offacto-dash-chart-col">
                    <div className="offacto-dash-chart-bars">
                        <div
                            className="offacto-dash-bar"
                            style={{ height: `${(invoiced[index] / max) * 100}%` }}
                            title={money(invoiced[index])}
                        />
                        <div
                            className="offacto-dash-bar offacto-dash-bar--received"
                            style={{ height: `${(received[index] / max) * 100}%` }}
                            title={money(received[index])}
                        />
                    </div>
                    <small>{label}</small>
                </div>
            ))}
        </div>
    );
}

export default function Dashboard({
    stats = {},
    chartData = {},
    awaitingBriefings = [],
    recentResponses = [],
    recentActivity = [],
    hasCompany = true,
}) {
    const { auth } = usePage().props;
    const { toast } = useUi();
    const [period, setPeriod] = useState('Y');

    const cashflow = chartData.cashflow || {};
    const labels = cashflow.labels || [];
    const paid = cashflow.paid || [];
    const outstanding = cashflow.outstanding || [];

    const chartRows = useMemo(() => {
        return labels.map((label, index) => ({
            label,
            invoiced: (paid[index] || 0) + (outstanding[index] || 0),
            received: paid[index] || 0,
        }));
    }, [labels, paid, outstanding]);

    const marginPct =
        stats.revenue > 0 ? Math.round((stats.netResult / stats.revenue) * 100) : 0;

    const heroCopy = useMemo(() => {
        const awaiting = stats.awaitingPaymentCount ?? 0;
        const overdueCount = stats.overdueInvoiceCount ?? 0;
        const overdueTotal = stats.overdueTotal ?? 0;

        let headline;
        if (awaiting > 0) {
            headline =
                awaiting === 1
                    ? t('dashboard.hero_awaiting_one')
                    : t('dashboard.hero_awaiting_many', { count: awaiting });
        } else {
            headline = t('dashboard.hero_all_paid');
        }

        let sub = '';
        if (overdueCount > 0 && overdueTotal > 0) {
            const amount = money(overdueTotal);
            sub =
                overdueCount === 1
                    ? t('dashboard.hero_overdue_one', { amount })
                    : t('dashboard.hero_overdue_many', { amount, count: overdueCount });
        }

        return { headline, sub };
    }, [stats]);

    if (!hasCompany) {
        return (
            <AuthenticatedLayout title={t('dashboard.title')}>
                <div className="offacto-dash-card p-8 text-center">
                    <h1 className="font-[Urbanist,system-ui,sans-serif] text-2xl font-extrabold text-[#0E1250]">
                        {t('dashboard.no_company_title')}
                    </h1>
                    <p className="mt-2 text-[14.5px] text-[#48537F]">{t('dashboard.no_company_body')}</p>
                    <Link href="/companies/create" className="offacto-dash-btn-ai mt-6 inline-flex">
                        {t('dashboard.add_company')}
                    </Link>
                </div>
            </AuthenticatedLayout>
        );
    }

    const briefingCount = awaitingBriefings.length + recentResponses.length;

    return (
        <AuthenticatedLayout title={t('dashboard.title')}>
            <div className="offacto-dash">
            <section className="offacto-dash-hero">
                <AuthDiamond size={90} className="pointer-events-none absolute right-10 -top-5" />
                <AuthDiamond size={40} delay="2s" className="pointer-events-none absolute right-44 bottom-0" />
                <span className="offacto-dash-hero-blob-a" aria-hidden="true" />
                <span className="offacto-dash-hero-blob-b" aria-hidden="true" />

                <div>
                    <span className="offacto-dash-eyebrow">
                        <Icon name="spark" />
                        {t('dashboard.smart_summary')}
                    </span>
                    <h1>
                        {t('dashboard.hero_greeting', { name: firstName(auth?.user?.name) })}
                        <br />
                        <span>{heroCopy.headline}</span>
                    </h1>
                    {heroCopy.sub ? <p>{heroCopy.sub}</p> : null}
                </div>

                <div className="offacto-dash-hero-actions">
                    <Link href="/invoices" className="offacto-dash-btn-ghost">
                        {t('dashboard.view_invoices')}
                    </Link>
                    <button
                        type="button"
                        className="offacto-dash-btn-ai"
                        onClick={() => toast.info(t('dashboard.reminder_toast'))}
                    >
                        <Icon name="spark" />
                        {t('dashboard.draft_reminder')}
                    </button>
                </div>
            </section>

            <div className="offacto-dash-toolbar">
                <div>
                    <b>{t('dashboard.period')}</b>{' '}
                    <span className="offacto-dash-toolbar-muted">· {periodLabel(period)}</span>
                </div>
                <div className="offacto-dash-toolbar-right">
                    <div className="offacto-dash-tabs" role="tablist" aria-label={t('dashboard.period')}>
                        {PERIODS.map((key) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={period === key}
                                className={period === key ? 'on' : undefined}
                                onClick={() => setPeriod(key)}
                            >
                                {key === 'Y' ? t('dashboard.quarter.Y') : t(`dashboard.quarter.${key}`)}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="offacto-dash-btn-outline"
                        onClick={() => toast.info(t('dashboard.vat_toast'))}
                    >
                        <Icon name="download" />
                        {t('dashboard.vat_return')}
                    </button>
                </div>
            </div>

            <div className="offacto-dash-grid-4">
                <DashboardKpi
                    hero
                    icon="euro"
                    label={t('dashboard.revenue')}
                    value={money(stats.revenue)}
                    trend={stats.revenue > 0 ? `▲ ${t('dashboard.vs_last_year')}` : '—'}
                />
                <DashboardKpi
                    icon="inbox"
                    label={t('dashboard.expenses')}
                    value={money(stats.expenses)}
                    trend={t('dashboard.from_incoming')}
                    trendMuted
                />
                <DashboardKpi
                    icon="spark"
                    label={t('dashboard.net_result')}
                    value={money(stats.netResult)}
                    trend={stats.revenue > 0 ? `${marginPct}% ${t('dashboard.margin')}` : '—'}
                />
                <DashboardKpi
                    icon="file"
                    label={t('dashboard.vat_payable')}
                    value={money(0)}
                    trend={
                        period === 'Y'
                            ? t('dashboard.vat_not_available')
                            : `${t('dashboard.vat_due')} ${VAT_DUE[period]}`
                    }
                    trendMuted
                />
            </div>

            <div className="offacto-dash-grid-21">
                <div className="offacto-dash-card">
                    <div className="offacto-dash-card-head">
                        <h3>
                            {t('dashboard.invoiced_vs_received')} · {periodLabel(period)}
                        </h3>
                        <div className="offacto-dash-legend">
                            <span>
                                <i /> {t('dashboard.invoiced')}
                            </span>
                            <span>
                                <i className="pale" /> {t('dashboard.received')}
                            </span>
                        </div>
                    </div>
                    <div className="offacto-dash-card-body">
                        <InvoicedReceivedChart
                            labels={chartRows.map((row) => row.label)}
                            invoiced={chartRows.map((row) => row.invoiced)}
                            received={chartRows.map((row) => row.received)}
                        />
                    </div>
                </div>

                <div className="offacto-dash-card">
                    <div className="offacto-dash-card-head">
                        <h3>{t('dashboard.recent_activity')}</h3>
                    </div>
                    <div className="offacto-dash-card-body offacto-dash-activity-body">
                        {recentActivity.length === 0 ? (
                            <p className="offacto-dash-empty">{t('dashboard.no_activity')}</p>
                        ) : (
                            recentActivity.map((item) => (
                                <div key={`${item.icon}-${item.title}`} className="offacto-dash-act">
                                    <span className="offacto-dash-act-icon">
                                        <Icon name={item.icon} />
                                    </span>
                                    <div className="min-w-0">
                                        {item.href ? (
                                            <Link href={item.href} className="offacto-dash-act-title">
                                                {item.title}
                                            </Link>
                                        ) : (
                                            <p className="offacto-dash-act-title">{item.title}</p>
                                        )}
                                        <span className="offacto-dash-act-meta">{item.meta}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="offacto-dash-grid-3">
                <div className="offacto-dash-card lift offacto-dash-promo">
                    <div className="offacto-dash-card-body">
                        <div className="offacto-dash-mini-row">
                            <span className="offacto-dash-ficon">
                                <Icon name="brief" />
                            </span>
                            {briefingCount > 0 ? (
                                <span className="offacto-dash-badge">
                                    {briefingCount} {t('dashboard.new')}
                                </span>
                            ) : null}
                        </div>
                        <h3>{t('nav.briefings')}</h3>
                        <p>{t('dashboard.briefings_blurb', { count: briefingCount })}</p>
                        <Link href="/briefings" className="offacto-dash-link">
                            {t('dashboard.open_briefings')} →
                        </Link>
                    </div>
                </div>

                <div className="offacto-dash-card lift offacto-dash-promo">
                    <div className="offacto-dash-card-body">
                        <div className="offacto-dash-mini-row">
                            <span className="offacto-dash-ficon">
                                <Icon name="offers" />
                            </span>
                            {stats.openOffersCount > 0 ? (
                                <span className="offacto-dash-badge ok">{t('dashboard.open_quotes_link')}</span>
                            ) : null}
                        </div>
                        <h3>{t('dashboard.open_quotes_title')}</h3>
                        <p>
                            {t('dashboard.open_quotes_blurb', {
                                amount: money(stats.openOffersTotal),
                                count: stats.openOffersCount ?? 0,
                            })}
                        </p>
                        <Link href="/offers" className="offacto-dash-link">
                            {t('dashboard.open_quotes_link')} →
                        </Link>
                    </div>
                </div>

                <div className="offacto-dash-card lift offacto-dash-promo">
                    <div className="offacto-dash-card-body">
                        <div className="offacto-dash-mini-row">
                            <span className="offacto-dash-ficon">
                                <Icon name="shield" />
                            </span>
                            <span className="offacto-dash-badge ok">{t('dashboard.peppol_connected')}</span>
                        </div>
                        <h3>{t('dashboard.peppol_title')}</h3>
                        <p>{t('dashboard.peppol_blurb')}</p>
                        <Link href="/company/settings?section=integrations" className="offacto-dash-link">
                            {t('dashboard.integrations')} →
                        </Link>
                    </div>
                </div>
            </div>
            </div>
        </AuthenticatedLayout>
    );
}
