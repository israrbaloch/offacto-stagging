import { Link, router } from '@inertiajs/react';
import CountUpMoney from '../../Components/CountUpMoney';
import Icon from '../../Components/Icon';
import Pagination from '../../Components/Pagination';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { useUi } from '../../context/UiContext';
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
    if (!customer) {
        return '—';
    }
    return customer.org_name || customerName(customer);
}

function invoiceHref(invoice) {
    const draft = String(invoice.status_relation?.name || 'draft').toLowerCase() === 'draft';
    return draft ? `/invoices/${invoice.id}/edit` : `/invoices/${invoice.id}`;
}

function statusKey(invoice) {
    if (invoice.payment_status === 'paid') {
        return 'paid';
    }
    if (invoice.is_overdue || (invoice.due_date && invoice.payment_status !== 'paid' && new Date(invoice.due_date) < new Date())) {
        return 'overdue';
    }
    const name = String(invoice.status_relation?.name || 'draft').toLowerCase();
    if (name === 'sent') {
        return 'sent';
    }
    if (name === 'applied') {
        return 'paid';
    }
    return name === 'draft' ? 'draft' : 'sent';
}

function statusBadgeClass(key) {
    if (key === 'paid') {
        return 'ok';
    }
    if (key === 'overdue') {
        return 'bad';
    }
    if (key === 'draft') {
        return 'grey';
    }
    return '';
}

function statusLabel(key) {
    const map = {
        paid: 'invoices.paid',
        overdue: 'invoices.overdue',
        sent: 'invoices.sent',
        draft: 'offers.kpi_draft',
        applied: 'invoices.applied',
    };
    const translationKey = map[key];
    if (translationKey) {
        return t(translationKey);
    }
    return key.charAt(0).toUpperCase() + key.slice(1);
}

function sendChannel(invoice) {
    if (invoice.peppol_sent_at) {
        return { labelKey: 'invoices.channel_peppol', badge: '' };
    }
    if (invoice.postbode_sent_at) {
        return { labelKey: 'invoices.channel_postbode', badge: 'warn' };
    }
    const sent = String(invoice.status_relation?.name || '').toLowerCase() === 'sent' || invoice.payment_status === 'paid';
    if (sent) {
        return { labelKey: 'invoices.channel_email', badge: 'grey' };
    }
    return null;
}

function queryParams(filters, overrides = {}) {
    const next = {
        search: filters.search || undefined,
        status_tab: filters.status_tab && filters.status_tab !== 'all' ? filters.status_tab : undefined,
        date_filter: filters.date_filter || undefined,
        ...overrides,
    };
    Object.keys(next).forEach((key) => {
        if (next[key] === undefined || next[key] === '') {
            delete next[key];
        }
    });
    return next;
}

function periodOptions() {
    const now = new Date();
    const year = now.getFullYear();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const prevQuarter = quarter === 1 ? 4 : quarter - 1;
    const prevYear = quarter === 1 ? year - 1 : year;

    return [
        { value: 'current_quarter', label: `Q${quarter} ${year}` },
        { value: 'last_quarter', label: `Q${prevQuarter} ${prevYear}` },
        { value: 'current_year', label: String(year) },
    ];
}

function InvoiceKpi({ icon, label, value }) {
    return (
        <div className="offacto-dash-card lift offacto-dash-kpi offacto-invoices-kpi">
            <span className="offacto-dash-kpi-corner" aria-hidden="true" />
            <div className="offacto-dash-kpi-ic">
                <Icon name={icon} />
            </div>
            <div className="offacto-dash-kpi-lbl">{label}</div>
            <div className="offacto-dash-kpi-val">
                <CountUpMoney value={value} />
            </div>
        </div>
    );
}

export default function Index({ invoices, stats = {}, filters = {} }) {
    const rows = invoices?.data || [];
    const statusTab = filters.status_tab || 'all';
    const dateFilter = filters.date_filter || 'current_quarter';
    const { toast, confirm } = useUi();

    async function deleteDraftInvoice(invoice, event) {
        event?.stopPropagation?.();
        if (statusKey(invoice) !== 'draft') {
            return;
        }
        if (
            !(await confirm({
                message: t('invoices.delete_confirm'),
                confirmLabel: t('common.delete'),
                danger: true,
            }))
        ) {
            return;
        }
        router.delete(`/invoices/${invoice.id}`, {
            onSuccess: () => toast.success(t('invoices.deleted_toast')),
        });
    }

    const monthName = new Date().toLocaleDateString(localeTag(), { month: 'short' });

    const tabs = [
        { id: 'all', label: t('invoices.tab_all') },
        { id: 'open', label: t('invoices.tab_open') },
        { id: 'paid', label: t('invoices.tab_paid') },
        { id: 'overdue', label: t('invoices.tab_overdue') },
        { id: 'credit', label: t('invoices.tab_credit') },
        { id: 'rec', label: t('invoices.tab_recurring') },
        { id: 'draft', label: t('invoices.tab_draft') },
    ];

    function setStatusTab(tab) {
        router.get('/invoices', queryParams(filters, { status_tab: tab === 'all' ? undefined : tab }), {
            preserveState: true,
        });
    }

    function setDateFilter(value) {
        router.get('/invoices', queryParams(filters, { date_filter: value || undefined }), {
            preserveState: true,
        });
    }

    const dueColumnLabel = statusTab === 'rec' ? t('invoices.next_run') : t('invoices.due_or_next');

    return (
        <AuthenticatedLayout title={t('invoices.title')}>
            <div className="offacto-briefings offacto-dash offacto-quotes-page offacto-invoices-page">
                <header className="offacto-brief-edit-ph">
                    <div>
                        <h1>{t('invoices.title')}</h1>
                        <p>{t('invoices.subtitle')}</p>
                    </div>
                    <div className="offacto-brief-edit-acts">
                        <button
                            type="button"
                            className="offacto-brief-btn"
                            onClick={() => toast.info(t('invoices.credit_note_hint'))}
                        >
                            <Icon name="invoice" />
                            {t('invoices.new_credit')}
                        </button>
                        <Link href="/invoices/create?recurring=1" className="offacto-brief-btn">
                            <Icon name="repeat" />
                            {t('invoices.new_recurring')}
                        </Link>
                        <Link href="/invoices/create" className="offacto-btn-p">
                            <Icon name="plus" />
                            {t('invoices.new')}
                        </Link>
                    </div>
                </header>

                <div className="offacto-dash-grid-4 offacto-quotes-kpi-grid">
                    <InvoiceKpi
                        icon="check"
                        label={t('invoices.kpi_paid_month', { month: monthName })}
                        value={stats.paid_month ?? 0}
                    />
                    <InvoiceKpi icon="file" label={t('invoices.outstanding')} value={stats.outstanding ?? 0} />
                    <InvoiceKpi icon="alert" label={t('invoices.overdue')} value={stats.overdue ?? 0} />
                    <InvoiceKpi
                        icon="repeat"
                        label={t('invoices.kpi_recurring_month')}
                        value={stats.recurring_month ?? 0}
                    />
                </div>

                <div className="offacto-brief-table-card offacto-dash-card">
                    <div className="offacto-quotes-toolbar">
                        <div className="offacto-dash-tabs" role="tablist" aria-label={t('invoices.title')}>
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
                            <select
                                className="offacto-invoices-period-select"
                                value={dateFilter}
                                onChange={(event) => setDateFilter(event.target.value)}
                                aria-label={t('common.filter')}
                            >
                                {periodOptions().map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="offacto-brief-btn-sm"
                                onClick={() => {
                                    window.location.href = `/invoices/export-zip${window.location.search}`;
                                }}
                            >
                                <Icon name="down" />
                                {t('invoices.export_zip_pdf')}
                            </button>
                            <button
                                type="button"
                                className="offacto-brief-btn-sm"
                                onClick={() => toast.info(t('invoices.export_ubl_toast'))}
                            >
                                <Icon name="down" />
                                {t('invoices.export_ubl')}
                            </button>
                        </div>
                    </div>

                    <div className="offacto-brief-table-wrap">
                        <table className="offacto-brief-table">
                            <thead>
                                <tr>
                                    <th>{t('invoices.number')}</th>
                                    <th>{t('dashboard.customer')}</th>
                                    <th>{t('invoices.date')}</th>
                                    <th>{dueColumnLabel}</th>
                                    <th>{t('invoices.channel')}</th>
                                    <th className="num">{t('offers.amount')}</th>
                                    <th>{t('common.status')}</th>
                                    <th className="offacto-invoice-row-act" aria-label={t('common.actions')} />
                                </tr>
                            </thead>
                            <tbody className="offacto-brief-table-click">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="offacto-brief-empty">
                                            {t('invoices.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((invoice) => {
                                        const href = invoiceHref(invoice);
                                        const key = statusKey(invoice);
                                        const channel = sendChannel(invoice);
                                        const isCredit = Boolean(invoice.parent_invoice_id);
                                        const negative = Number(invoice.total) < 0;
                                        const dueValue =
                                            statusTab === 'rec' && invoice.next_run_at
                                                ? prettyDateShort(invoice.next_run_at)
                                                : prettyDateShort(invoice.due_date);
                                        const overdueDue = key === 'overdue';

                                        return (
                                            <tr key={invoice.id} onClick={() => router.visit(href)}>
                                                <td>
                                                    <b>{invoice.invoice_number || t('offers.untitled')}</b>
                                                    {isCredit && invoice.parent_invoice?.invoice_number ? (
                                                        <div className="offacto-invoice-num-sub">
                                                            {t('invoices.credit_for', {
                                                                number: invoice.parent_invoice.invoice_number,
                                                            })}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td>
                                                    <div className="offacto-brief-who">
                                                        <span className="offacto-brief-av">{initials(invoice.customer)}</span>
                                                        <span>{displayName(invoice.customer)}</span>
                                                    </div>
                                                </td>
                                                <td>{prettyDateShort(invoice.invoice_date)}</td>
                                                <td className={overdueDue ? 'offacto-invoice-due-overdue' : undefined}>
                                                    {dueValue}
                                                </td>
                                                <td>
                                                    {channel ? (
                                                        <span
                                                            className={`offacto-demo-badge nd ${channel.badge}`.trim()}
                                                        >
                                                            {t(channel.labelKey)}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="num">
                                                    <b className={negative ? 'offacto-invoice-amount-negative' : undefined}>
                                                        {money(invoice.total)}
                                                    </b>
                                                </td>
                                                <td>
                                                    <span className={`offacto-demo-badge ${statusBadgeClass(key)}`.trim()}>
                                                        {statusLabel(key)}
                                                    </span>
                                                </td>
                                                <td className="offacto-invoice-row-act">
                                                    {key === 'draft' ? (
                                                        <button
                                                            type="button"
                                                            className="offacto-invoice-row-delete"
                                                            aria-label={t('common.delete')}
                                                            onClick={(event) => deleteDraftInvoice(invoice, event)}
                                                        >
                                                            <Icon name="trash" />
                                                        </button>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {invoices?.last_page > 1 ? (
                        <div className="offacto-brief-pagination">
                            <Pagination links={invoices.links} />
                        </div>
                    ) : null}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
