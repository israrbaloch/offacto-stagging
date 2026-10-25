import Logo from './Logo';
import { DEFAULT_BRAND_PRIMARY, DEFAULT_BRAND_SECONDARY, themeCssVars } from '../lib/brand';
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

export default function InvoicePreviewModern({
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
    iban = '',
    structuredReference = '',
    showMollieLink = false,
    fromVatNumber = '',
    toVatNumber = '',
}) {
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
            : isCredit
              ? t('invoices.doc_credit')
              : t('invoices.doc_standard');

    const fromLine = [from.street, from.house].filter(Boolean).join(' ');
    const fromCity = [from.postal_code, from.city].filter(Boolean).join(' ');
    const lineLabel = (item) => item.description || item.service_name || '—';
    const lineTotal = (item) => Number(item.quantity || 0) * Number(item.price || item.unit_price || 0);

    return (
        <div className="offacto-demo-paper offacto-demo-paper-modern-layout" style={cssVars}>
            <div className="offacto-demo-modern-hero">
                <div className="offacto-demo-modern-hero-left">
                    {logoUrl ? (
                        <img src={logoUrl} alt="" className="offacto-demo-paper-logo" />
                    ) : (
                        <Logo className="offacto-demo-paper-logo-svg" />
                    )}
                    <div className="offacto-demo-paper-from-name">{from.name || t('company_settings.preview_company_fallback')}</div>
                    <div className="offacto-demo-paper-muted offacto-demo-modern-hero-muted">
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
                <div className="offacto-demo-modern-hero-right">
                    <h4>{title}</h4>
                    <div className="offacto-demo-modern-chip">{number || '—'}</div>
                    <div className="offacto-demo-paper-muted">{demoDate(date)}</div>
                    {documentType === 'quote' && validUntil ? (
                        <div className="offacto-demo-paper-muted">
                            {t('offers.valid_until_label')}: {demoDate(validUntil)}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="offacto-demo-modern-billto">
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

            <table className="offacto-demo-paper-lines offacto-demo-modern-lines">
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

            <div className="offacto-demo-modern-totals">
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
                    <div className="row total">
                        <span>{isCredit ? t('invoices.preview_to_refund') : t('invoices.preview_amount_due')}</span>
                        <span>{money(sign * amountDue)}</span>
                    </div>
                </div>
            </div>

            {!isCredit && documentType === 'invoice' ? (
                <div className="offacto-demo-modern-pay row">
                    <div>
                        {t('invoices.preview_pay_before')} <b>{demoDate(dueDate)}</b>
                        <br />
                        {iban || '—'}
                        <br />
                        <b>{structuredReference || '—'}</b>
                        {showMollieLink ? (
                            <>
                                <br />
                                <span className="offacto-demo-paper-mollie">{t('invoices.preview_mollie_cta')}</span>
                            </>
                        ) : null}
                    </div>
                    <div className="offacto-demo-paper-qr" aria-hidden="true" />
                </div>
            ) : null}
        </div>
    );
}
