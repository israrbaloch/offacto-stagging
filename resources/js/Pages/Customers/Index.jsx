import { router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import CountUpMoney from '../../Components/CountUpMoney';
import CustomerDrawer from '../../Components/CustomerDrawer';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { useUi } from '../../context/UiContext';
import { t } from '../../lib/i18n';
import { customerTypeLabel } from '../../lib/customerTypes';
import { customerName, money } from '../../lib/utils';

function initials(customer) {
    const source = customer?.org_name || [customer?.first_name, customer?.surname].filter(Boolean).join(' ');
    if (!source) {
        return '—';
    }
    return source
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

function displayName(customer) {
    return customer?.org_name || customerName(customer);
}

function statusBadgeClass(name) {
    const key = String(name || '').toLowerCase();
    if (['active', 'approved'].includes(key)) {
        return 'ok';
    }
    if (['inactive', 'rejected', 'archived'].includes(key)) {
        return 'bad';
    }
    if (['pending', 'prospect'].includes(key)) {
        return 'warn';
    }
    return 'grey';
}

function queryParams(filters, overrides = {}) {
    const next = {
        search: filters.search || undefined,
        type_tab: filters.type_tab && filters.type_tab !== 'all' ? filters.type_tab : undefined,
        customer: filters.customer || undefined,
        drawer: filters.drawer || undefined,
        ...overrides,
    };
    Object.keys(next).forEach((key) => {
        if (next[key] === undefined || next[key] === '') {
            delete next[key];
        }
    });
    return next;
}

function CustomerKpi({ icon, label, value, moneyValue = false }) {
    return (
        <div className="offacto-dash-card lift offacto-dash-kpi offacto-customers-kpi">
            <span className="offacto-dash-kpi-corner" aria-hidden="true" />
            <div className="offacto-dash-kpi-ic">
                <Icon name={icon} />
            </div>
            <div className="offacto-dash-kpi-lbl">{label}</div>
            <div className="offacto-dash-kpi-val">{moneyValue ? <CountUpMoney value={value} /> : value}</div>
        </div>
    );
}

function creditsafeBadgeClass(rating) {
    if (!rating || rating === '—') {
        return '';
    }
    if (rating === 'A') {
        return 'ok';
    }
    if (rating === 'B') {
        return '';
    }
    return 'warn';
}

export default function Index({
    customers = [],
    stats = {},
    filters = {},
    statuses = {},
    countries = {},
    countryCodes = {},
    defaultStatusId,
    creditsafeConfigured = false,
    peppolConfigured = false,
    drawerCreditCheck = null,
}) {
    const { toast } = useUi();
    const typeTab = filters.type_tab || 'all';
    const [search, setSearch] = useState(filters.search ?? '');
    const skipSearchDebounce = useRef(true);

    function drawerStateFromFilters(f) {
        if (f.drawer === 'new') {
            return { mode: 'new', id: null };
        }
        if (f.customer) {
            return { mode: 'edit', id: Number(f.customer) };
        }
        return { mode: null, id: null };
    }

    const [drawerState, setDrawerState] = useState(() => drawerStateFromFilters(filters));

    useEffect(() => {
        setDrawerState(drawerStateFromFilters(filters));
    }, [filters.customer, filters.drawer]);

    const drawerCustomer = useMemo(() => {
        if (drawerState.mode !== 'edit' || !drawerState.id) {
            return null;
        }
        return customers.find((row) => row.id === drawerState.id) || null;
    }, [customers, drawerState]);

    const drawerCreditCheckResolved =
        drawerCreditCheck && drawerCustomer && drawerCreditCheck.customer_id === drawerCustomer.id
            ? drawerCreditCheck
            : drawerCustomer?.latest_credit_check || null;

    const drawerOpen =
        drawerState.mode === 'new' || (drawerState.mode === 'edit' && Boolean(drawerCustomer));

    useEffect(() => {
        if (!drawerOpen) {
            document.body.style.removeProperty('overflow');
            return undefined;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [drawerOpen]);

    function syncDrawerUrl(overrides = {}) {
        const params = new URLSearchParams();
        const merged = { ...filters, ...overrides };
        if (merged.search) {
            params.set('search', merged.search);
        }
        if (merged.type_tab && merged.type_tab !== 'all') {
            params.set('type_tab', merged.type_tab);
        }
        if (merged.drawer === 'new') {
            params.set('drawer', 'new');
        } else if (merged.customer) {
            params.set('customer', String(merged.customer));
        }
        const qs = params.toString();
        window.history.replaceState({}, '', qs ? `/customers?${qs}` : '/customers');
    }

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        if (skipSearchDebounce.current) {
            skipSearchDebounce.current = false;
            return undefined;
        }
        const id = window.setTimeout(() => {
            router.get('/customers', queryParams(filters, { search: search || undefined }), {
                preserveState: true,
                replace: true,
            });
        }, 350);
        return () => window.clearTimeout(id);
    }, [search]);

    function setTypeTab(tab) {
        router.get('/customers', queryParams(filters, { type_tab: tab === 'all' ? undefined : tab }), {
            preserveState: true,
        });
    }

    function openNewDrawer() {
        setDrawerState({ mode: 'new', id: null });
        syncDrawerUrl({ drawer: 'new', customer: undefined });
    }

    function openCustomerDrawer(customer) {
        setDrawerState({ mode: 'edit', id: customer.id });
        syncDrawerUrl({ customer: customer.id, drawer: undefined });
    }

    function closeDrawer() {
        setDrawerState({ mode: null, id: null });
        syncDrawerUrl({ customer: undefined, drawer: undefined });
    }

    const tabs = [
        { id: 'all', label: t('common.all') },
        { id: 'vzw', label: t('customers.type_vzw') },
        { id: 'company', label: t('customers.type_company') },
        { id: 'gov', label: t('customers.type_gov') },
        { id: 'individual', label: t('customers.type_individual') },
    ];

    return (
        <AuthenticatedLayout title={t('customers.title')}>
            <div className="offacto-briefings offacto-dash offacto-quotes-page offacto-customers-page">
                <header className="offacto-brief-edit-ph">
                    <div>
                        <h1>{t('customers.title')}</h1>
                        <p>{t('customers.subtitle_demo')}</p>
                    </div>
                    <button type="button" className="offacto-btn-p" onClick={openNewDrawer}>
                        <Icon name="plus" />
                        {t('customers.new')}
                    </button>
                </header>

                <div className="offacto-dash-grid-4 offacto-quotes-kpi-grid">
                    <CustomerKpi icon="customers" label={t('common.total')} value={stats.total ?? 0} />
                    <CustomerKpi icon="building" label={t('customers.organizations')} value={stats.organizations ?? 0} />
                    <CustomerKpi icon="send" label={t('customers.on_peppol')} value={stats.on_peppol ?? 0} />
                    <CustomerKpi icon="euro" label={t('customers.outstanding')} value={stats.outstanding ?? 0} moneyValue />
                </div>

                <div className="offacto-brief-table-card offacto-dash-card">
                    <div className="offacto-quotes-toolbar">
                        <div className="offacto-dash-tabs" role="tablist" aria-label={t('customers.title')}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={typeTab === tab.id}
                                    className={typeTab === tab.id ? 'on' : ''}
                                    onClick={() => setTypeTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="offacto-quotes-toolbar-r">
                            <input
                                className="offacto-brief-inp offacto-quotes-filter-inp"
                                placeholder={t('customers.search_placeholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="button" className="offacto-brief-btn-sm" onClick={() => toast.info(t('customers.import_csv_toast'))}>
                                <Icon name="up" />
                                {t('customers.import_csv')}
                            </button>
                        </div>
                    </div>

                    <div className="offacto-brief-table-wrap">
                        <table className="offacto-brief-table">
                            <thead>
                                <tr>
                                    <th>{t('dashboard.customer')}</th>
                                    <th>{t('common.type')}</th>
                                    <th>{t('customers.vat_number')}</th>
                                    <th>{t('customers.e_invoice')}</th>
                                    <th>Creditsafe</th>
                                    <th>{t('customers.docs')}</th>
                                    <th className="num">{t('customers.outstanding')}</th>
                                    <th>{t('common.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="offacto-brief-table-click">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="offacto-brief-empty">
                                            {t('customers.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => {
                                        const status = customer.status_relation?.name || '—';
                                        return (
                                            <tr key={customer.id} onClick={() => openCustomerDrawer(customer)}>
                                                <td>
                                                    <div className="offacto-table-who">
                                                        <span className="offacto-table-av">{initials(customer)}</span>
                                                        <div>
                                                            <b>{displayName(customer)}</b>
                                                            <small>{customer.email || '—'}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{customerTypeLabel(customer.type)}</td>
                                                <td>
                                                    {customer.vat_number ? (
                                                        <span className="offacto-customer-vat">
                                                            {customer.vat_number}
                                                            {customer.vat_valid ? (
                                                                <span className="offacto-customer-vies-ok" title="VIES">
                                                                    ✓
                                                                </span>
                                                            ) : null}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td>
                                                    {customer.peppol_eligible ? (
                                                        <span className="offacto-demo-badge nd">Peppol</span>
                                                    ) : (
                                                        <span className="offacto-demo-badge grey nd">{t('invoices.channel_email')}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {customer.creditsafe_rating ? (
                                                        <span
                                                            className={`offacto-demo-badge nd ${creditsafeBadgeClass(customer.creditsafe_rating)}`.trim()}
                                                        >
                                                            {customer.creditsafe_rating}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td>
                                                    {customer.documents_count ? (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Icon name="clip" />
                                                            {customer.documents_count}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="num">
                                                    {customer.outstanding > 0 ? <b>{money(customer.outstanding)}</b> : '—'}
                                                </td>
                                                <td>
                                                    <span className={`offacto-demo-badge ${statusBadgeClass(status)}`.trim()}>
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CustomerDrawer
                open={drawerOpen}
                onClose={closeDrawer}
                customer={drawerCustomer}
                statuses={statuses}
                countries={countries}
                defaultStatusId={defaultStatusId}
                latestCreditCheck={drawerCreditCheckResolved}
                creditsafeConfigured={creditsafeConfigured}
                peppolConfigured={peppolConfigured}
                countryCodes={countryCodes}
            />
        </AuthenticatedLayout>
    );
}
