import { Link, router } from '@inertiajs/react';
import Icon from '../../Components/Icon';
import Pagination from '../../Components/Pagination';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { AuthDiamond } from '../../Layouts/AuthSplitLayout';
import { localeTag, t } from '../../lib/i18n';
import { money } from '../../lib/utils';

function statusBadgeClass(status) {
    if (status === 'active') {
        return 'ok';
    }
    if (status === 'draft' || status === 'closed') {
        return 'grey';
    }
    return '';
}

function statusLabel(status) {
    const key = `briefings.status.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
}

function sendQuote(response) {
    if (response.quote_action === 'edit' && response.offer_id) {
        router.visit(`/offers/${response.offer_id}/edit?from=briefing`);
        return;
    }
    if (response.quote_action === 'generate') {
        router.post(
            `/briefings/${response.briefing_id}/responses/${response.id}/generate-quote`,
            {},
            { preserveScroll: true },
        );
    }
}

function formatReceived(iso) {
    if (!iso) {
        return '—';
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return `${t('briefings.today')} ${date.toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString(localeTag(), { day: 'numeric', month: 'numeric' });
}

function BriefingCard({ briefing }) {
    const title = briefing.title || t('briefings.untitled');

    return (
        <Link href={`/briefings/${briefing.id}/edit`} className="offacto-brief-kpi relative overflow-hidden">
            <span className="offacto-brief-kpi-corner" aria-hidden="true" />
            <div className="offacto-brief-kpi-ic">
                <Icon name="brief" />
            </div>
            <div className="offacto-brief-kpi-head">
                <span className="offacto-brief-kpi-title">{title}</span>
                <span className={`offacto-status-badge ${statusBadgeClass(briefing.status)}`}>
                    {statusLabel(briefing.status)}
                </span>
            </div>
            <div className="offacto-brief-kpi-val">
                {briefing.responses_count ?? 0}{' '}
                <span>{t('briefings.responses_unit')}</span>
            </div>
            <div className="offacto-brief-kpi-lbl">{briefing.card_subtitle}</div>
            <div className="offacto-brief-kpi-hint">
                <Icon name="link" />
                {briefing.public_link || t('briefings.link_not_generated')}
            </div>
        </Link>
    );
}

export default function Index({ briefings, recentResponses = [] }) {
    const rows = briefings?.data || [];

    return (
        <AuthenticatedLayout title={t('briefings.title')}>
            <div className="offacto-briefings">
                <section className="offacto-brief-hero">
                    <AuthDiamond size={90} className="pointer-events-none absolute right-10 -top-5 text-[#9d8df1]/20" />
                    <span className="offacto-dash-hero-blob-a" aria-hidden="true" />
                    <div className="relative z-[1]">
                        <h1>{t('briefings.title')}</h1>
                        <p>{t('briefings.hero_intro')}</p>
                    </div>
                    <Link href="/briefings/create" className="offacto-btn-p relative z-[1]">
                        <Icon name="plus" />
                        {t('briefings.new')}
                    </Link>
                </section>

                <div className="offacto-brief-grid">
                    {rows.length === 0 ? (
                        <p className="offacto-brief-empty col-span-full">{t('briefings.empty')}</p>
                    ) : (
                        rows.map((briefing) => <BriefingCard key={briefing.id} briefing={briefing} />)
                    )}
                </div>

                {briefings?.last_page > 1 ? (
                    <div className="offacto-brief-pagination">
                        <Pagination links={briefings.links} />
                    </div>
                ) : null}

                <div className="offacto-brief-table-card">
                    <div className="offacto-brief-table-head">
                        <h3>{t('briefings.recent_responses')}</h3>
                    </div>
                    <div className="offacto-brief-table-wrap">
                        <table className="offacto-brief-table">
                            <thead>
                                <tr>
                                    <th>{t('briefings.customer')}</th>
                                    <th>{t('briefings.title')}</th>
                                    <th>{t('briefings.received')}</th>
                                    <th className="num">{t('briefings.estimate')}</th>
                                    <th>{t('briefings.result')}</th>
                                    <th className="num" aria-hidden="true" />
                                </tr>
                            </thead>
                            <tbody>
                                {recentResponses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="offacto-brief-empty">
                                            {t('briefings.no_responses')}
                                        </td>
                                    </tr>
                                ) : (
                                    recentResponses.map((response) => (
                                        <tr key={response.id}>
                                            <td>
                                                <div className="offacto-brief-who">
                                                    <span className="offacto-brief-av">{response.customer_initials}</span>
                                                    <b>{response.customer_name}</b>
                                                </div>
                                            </td>
                                            <td>{response.briefing_title || t('briefings.untitled')}</td>
                                            <td>{formatReceived(response.submitted_at)}</td>
                                            <td className="num">
                                                <b>{response.estimate != null ? money(response.estimate) : '—'}</b>
                                            </td>
                                            <td>
                                                {response.draft_quote_ready ? (
                                                    <span className="offacto-status-badge ai nd">
                                                        <Icon name="spark" />
                                                        {t('briefings.draft_quote_ready')}
                                                    </span>
                                                ) : (
                                                    <span className="offacto-status-badge">
                                                        {response.quote_status?.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="num">
                                                {response.quote_action === 'generate' ||
                                                response.quote_action === 'edit' ? (
                                                    <button
                                                        type="button"
                                                        className="offacto-btn-sm"
                                                        onClick={() => sendQuote(response)}
                                                    >
                                                        {t('briefings.send_quote')} →
                                                    </button>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
