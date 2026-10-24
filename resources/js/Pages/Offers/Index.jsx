import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import CountUpMoney from '../../Components/CountUpMoney';
import Icon from '../../Components/Icon';
import Pagination from '../../Components/Pagination';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { localeTag, t } from '../../lib/i18n';
import { customerName, money } from '../../lib/utils';

function prettyDateShort(value) {
    if (!value) {
        return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString(localeTag(), { day: 'numeric', month: 'numeric', year: 'numeric' });
}

function displayName(customer) {
    if (!customer) {
        return '—';
    }
    return customer.org_name || customerName(customer);
}

function stripHtml(text) {
    return String(text)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function offerSubject(offer) {
    if (offer.desc) {
        const plain = stripHtml(offer.desc);
        if (plain) {
            return plain.length > 140 ? `${plain.slice(0, 137)}…` : plain;
        }
    }
    if (offer.intro) {
        const plain = stripHtml(offer.intro);
        if (plain) {
            return plain.length > 140 ? `${plain.slice(0, 137)}…` : plain;
        }
    }
    return t('offers.untitled');
}

function statusKey(offer) {
    const name = String(offer.status_relation?.name || 'draft').toLowerCase();
    if (name === 'viewed') {
        return 'sent';
    }
    if (name === 'rejected') {
        return 'declined';
    }
    return name;
}

function statusBadgeClass(key) {
    if (key === 'accepted') {
        return 'ok';
    }
    if (key === 'declined') {
        return 'bad';
    }
    if (key === 'draft') {
        return 'grey';
    }
    return '';
}

function statusLabel(key) {
    const map = {
        draft: 'offers.kpi_draft',
        sent: 'offers.kpi_sent',
        accepted: 'offers.accepted',
        declined: 'offers.kpi_declined',
        pending: 'offers.status_pending',
        open: 'offers.status_open',
        invoiced: 'offers.invoiced',
    };
    const translationKey = map[key];
    if (translationKey) {
        return t(translationKey);
    }
    return key.charAt(0).toUpperCase() + key.slice(1);
}

function offerHref(offer) {
    const key = String(offer.status_relation?.name || 'draft').toLowerCase();
    if (key === 'draft') {
        return `/offers/${offer.id}/edit`;
    }
    return `/offers/${offer.id}`;
}

function queryParams(filters, overrides = {}) {
    const next = {
        search: filters.search || undefined,
        status_tab: filters.status_tab && filters.status_tab !== 'all' ? filters.status_tab : undefined,
        ...overrides,
    };
    Object.keys(next).forEach((key) => {
        if (next[key] === undefined || next[key] === '') {
            delete next[key];
        }
    });
    return next;
}

function kpiBadgeClass(key) {
    return statusBadgeClass(key);
}

function KpiCard({ kpiKey, label, value }) {
    const badgeMod = kpiBadgeClass(kpiKey);

    return (
        <div className="offacto-dash-card lift offacto-dash-kpi offacto-quotes-kpi">
            <span className="offacto-dash-kpi-corner" aria-hidden="true" />
            <span className={`offacto-demo-badge ${badgeMod}`.trim()}>{label}</span>
            <div className="offacto-dash-kpi-val">
                <CountUpMoney value={value} />
            </div>
        </div>
    );
}

export default function Index({ offers, stats = {}, filters = {} }) {
    const rows = offers?.data || [];
    const statusTab = filters.status_tab || 'all';
    const [search, setSearch] = useState(filters.search ?? '');
    const skipSearchDebounce = useRef(true);

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        if (skipSearchDebounce.current) {
            skipSearchDebounce.current = false;
            return undefined;
        }
        const id = window.setTimeout(() => {
            router.get('/offers', queryParams(filters, { search: search || undefined }), {
                preserveState: true,
                replace: true,
            });
        }, 350);
        return () => window.clearTimeout(id);
    }, [search]);

    function setStatusTab(tab) {
        router.get('/offers', queryParams(filters, { status_tab: tab === 'all' ? undefined : tab }), {
            preserveState: true,
        });
    }

    const tabs = [
        { id: 'all', label: t('offers.tab_all') },
        { id: 'open', label: t('offers.tab_open') },
        { id: 'accepted', label: t('offers.tab_accepted') },
    ];

    const kpis = [
        { key: 'draft', label: t('offers.kpi_draft') },
        { key: 'sent', label: t('offers.kpi_sent') },
        { key: 'accepted', label: t('offers.accepted') },
        { key: 'declined', label: t('offers.kpi_declined') },
    ];

    return (
        <AuthenticatedLayout title={t('offers.title')}>
            <div className="offacto-briefings offacto-dash offacto-quotes-page">
                <header className="offacto-brief-edit-ph">
                    <div>
                        <h1>{t('offers.title')}</h1>
                        <p>{t('offers.subtitle')}</p>
                    </div>
                    <Link href="/offers/create" className="offacto-btn-p">
                        <Icon name="plus" />
                        {t('offers.new')}
                    </Link>
                </header>

                <div className="offacto-dash-grid-4 offacto-quotes-kpi-grid">
                    {kpis.map((kpi) => (
                        <KpiCard kpiKey={kpi.key} label={kpi.label} value={stats[kpi.key] ?? 0} />
                    ))}
                </div>

                <div className="offacto-brief-table-card offacto-dash-card">
                    <div className="offacto-quotes-toolbar">
                        <div className="offacto-dash-tabs" role="tablist" aria-label={t('offers.title')}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={statusTab === tab.id}
                                    className={statusTab === tab.id ? 'on' : ''}
                                    onClick={() => setStatusTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="offacto-quotes-toolbar-r">
                            <input
                                type="search"
                                className="offacto-brief-inp offacto-quotes-filter-inp"
                                placeholder={t('offers.filter_customer')}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                            <button
                                type="button"
                                className="offacto-brief-btn-sm"
                                onClick={() => {
                                    window.location.href = `/offers/export-zip${window.location.search}`;
                                }}
                            >
                                <Icon name="down" />
                                {t('offers.export_zip')}
                            </button>
                        </div>
                    </div>

                    <div className="offacto-brief-table-wrap">
                        <table className="offacto-brief-table">
                            <thead>
                                <tr>
                                    <th>{t('offers.number')}</th>
                                    <th>{t('offers.subject')}</th>
                                    <th>{t('dashboard.customer')}</th>
                                    <th>{t('offers.issue_date')}</th>
                                    <th>{t('offers.views')}</th>
                                    <th className="num">{t('offers.amount')}</th>
                                    <th>{t('common.status')}</th>
                                    <th className="num" aria-hidden="true" />
                                </tr>
                            </thead>
                            <tbody className="offacto-brief-table-click">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="offacto-brief-empty">
                                            {t('offers.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((offer) => {
                                        const key = statusKey(offer);
                                        const href = offerHref(offer);
                                        const signed =
                                            offer.has_acceptance_artifact ||
                                            offer.accepted_at ||
                                            offer.has_signature;

                                        return (
                                            <tr key={offer.id} onClick={() => router.visit(href)}>
                                                <td>
                                                    <b>{offer.offer_number}</b>
                                                    {offer.from_briefing ? (
                                                        <div className="offacto-quote-num-sub">
                                                            <span className="offacto-demo-badge ai nd">
                                                                <Icon name="brief" />
                                                                {t('offers.from_briefing')}
                                                            </span>
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td>{offerSubject(offer)}</td>
                                                <td>{displayName(offer.customer)}</td>
                                                <td>{prettyDateShort(offer.offer_date)}</td>
                                                <td>
                                                    {offer.view_count ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Icon name="eye" />
                                                            {t('offers.views_count', { count: offer.view_count })}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="num">
                                                    <b>{money(offer.total)}</b>
                                                </td>
                                                <td>
                                                    <span className={`offacto-demo-badge ${statusBadgeClass(key)}`.trim()}>
                                                        {statusLabel(key)}
                                                    </span>
                                                    {signed ? (
                                                        <span className="offacto-quote-signed">✍ {t('offers.has_signature_badge')}</span>
                                                    ) : null}
                                                </td>
                                                <td className="num">
                                                    {key === 'accepted' ? (
                                                        <Link
                                                            href={`/invoices/from-offer/${offer.id}`}
                                                            className="offacto-brief-btn-sm"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            → {t('offers.to_invoice')}
                                                        </Link>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {offers?.last_page > 1 ? (
                        <div className="offacto-brief-pagination">
                            <Pagination links={offers.links} />
                        </div>
                    ) : null}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
