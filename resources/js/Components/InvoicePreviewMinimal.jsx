import Logo from './Logo';
import { DEFAULT_BRAND_PRIMARY, themeCssVars } from '../lib/brand';
import { money } from '../lib/utils';
import { t } from '../lib/i18n';

function demoDate(value) {
    if (!value) {
        return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function InvoicePreviewMinimal({
    number,
    date,
    dueDate,
    validUntil,
    from = {},
    to = {},
    items = [],
    vatRate = 21,
    totalsOverride,
    theme = {},
    logoUrl,
    documentType = 'invoice',
    intraEu = false,
    attachments = [],
    iban = '',
    structuredReference = '',
    showMollieLink = false,
    fromVatNumber = '',
    toVatNumber = '',
    paperClassName = 'offacto-demo-paper',
}) {
    const brand = theme.primary || DEFAULT_BRAND_PRIMARY;
    const cssVars = themeCssVars(theme);
    const isCredit = documentType === 'credit';
    const sign = isCredit ? -1 : 1;

    const priced = items.filter((item) => item.kind !== 'text');
    const calcSubtotal = priced.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || item.unit_price || 0),
        0,
    );
    const subtotal = totalsOverride?.subtotal ?? calcSubtotal;
    const vatAmount = totalsOverride?.tax ?? (intraEu ? 0 : calcSubtotal * (Number(vatRate) / 100));
    const total = totalsOverride?.total ?? subtotal + vatAmount;
    const amountDue = intraEu ? subtotal : total;

    const title =
        documentType === 'quote'
            ? t('offers.doc_quotation')
            : documentType === 'credit'
              ? t('invoices.doc_credit')
              : t('invoices.doc_standard');

    const fromLine = [from.street, from.house].filter(Boolean).join(' ');
    const fromCity = [from.postal_code, from.city].filter(Boolean).join(' ');

    const lineLabel = (item) => item.description || item.service_name || '—';
    const lineTotal = (item) => Number(item.quantity || 0) * Number(item.price || item.unit_price || 0);

    return (
        <div className={paperClassName} style={cssVars}>
            <div className="offacto-demo-paper-head row">
                <div>
                    {logoUrl ? (
                        <img src={logoUrl} alt="" className="offacto-demo-paper-logo" />
                    ) : (
                        <Logo className="offacto-demo-paper-logo-svg" />
                    )}
                    <div className="offacto-demo-paper-from-name">{from.name || 'Your company'}</div>
                    <div className="offacto-demo-paper-muted">
                        {fromLine && (
                            <>
                                {fromLine}
                                <br />
                            </>
                        )}
                        {fromCity}
                        {fromVatNumber ? (
                            <>
                                <br />
                                {fromVatNumber}
                            </>
                        ) : null}
                    </div>
                </div>
                <div className="offacto-demo-paper-head-right">
                    <h4>{title}</h4>
                    <div className="offacto-demo-paper-muted">
                        {number || '—'}
                        <br />
                        {demoDate(date)}
                        {documentType === 'quote' && validUntil ? (
                            <>
                                <br />
                                {t('offers.valid_until_label')}: {demoDate(validUntil)}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="offacto-demo-paper-billto">
                <div className="offacto-demo-paper-billto-lbl">{t('invoices.preview_bill_to')}</div>
                <b>{to.name || t('invoices.preview_client_pending')}</b>
                {to.address ? (
                    <>
                        <br />
                        <span className="whitespace-pre-line">{to.address}</span>
                    </>
                ) : null}
                {toVatNumber ? (
                    <>
                        <br />
                        {toVatNumber}
                    </>
                ) : null}
            </div>

            <table className="offacto-demo-paper-lines">
                <thead>
                    <tr>
                        <th>{t('invoices.line_description')}</th>
                        <th className="num">{t('invoices.line_qty')}</th>
                        <th className="num">{t('invoices.line_total')}</th>
                    </tr>
                </thead>
                <tbody>
                    {priced.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="offacto-demo-paper-empty">
                                {t('invoices.preview_no_lines')}
                            </td>
                        </tr>
                    ) : (
                        priced.map((item, index) => (
                            <tr key={index}>
                                <td>{lineLabel(item)}</td>
                                <td className="num">{item.quantity ?? '—'}</td>
                                <td className="num">{money(sign * lineTotal(item))}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="offacto-demo-paper-totals">
                <div className="row">
                    <span>{t('invoices.subtotal')}</span>
                    <span>{money(sign * subtotal)}</span>
                </div>
                <div className="row muted">
                    <span>
                        {t('invoices.vat')} ({vatRate}%)
                    </span>
                    <span>{money(sign * (intraEu ? 0 : vatAmount))}</span>
                </div>
                <div className="row total" style={{ color: brand }}>
                    <span>{isCredit ? t('invoices.preview_to_refund') : t('invoices.preview_amount_due')}</span>
                    <span>{money(sign * amountDue)}</span>
                </div>
            </div>

            {intraEu ? <div className="offacto-demo-paper-rc">{t('invoices.reverse_charge_short')}</div> : null}

            {!isCredit ? (
                <div className="offacto-demo-paper-pt row">
                    <div>
                        {t('invoices.preview_pay_before')} <b>{demoDate(dueDate)}</b>
                        <br />
                        {iban || '—'}
                        <br />
                        <b>{structuredReference || '—'}</b>
                        {showMollieLink ? (
                            <>
                                <br />
                                <span className="offacto-demo-paper-mollie" style={{ color: brand }}>
                                    {t('invoices.preview_mollie_cta')}
                                </span>
                            </>
                        ) : null}
                    </div>
                    <div className="offacto-demo-paper-qr" aria-hidden="true" />
                </div>
            ) : null}

            {attachments.length ? (
                <div className="offacto-demo-paper-att">
                    {attachments.map((name) => (
                        <span key={name}>📎 {name}</span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
