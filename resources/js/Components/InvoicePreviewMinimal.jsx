import Logo from './Logo';
import { DEFAULT_BRAND_PRIMARY, themeCssVars } from '../lib/brand';
import { formatCalendarDate, money } from '../lib/utils';
import { lineAmount, subtotalFromLines, totalAmount, vatAmount } from '../lib/money';
import { t } from '../lib/i18n';
import InvoiceLineLabel, { visiblePreviewLines } from './InvoiceLineLabel';
import InvoicePaymentBlock from './InvoicePaymentBlock';
import { formatVatNumber } from '../lib/belgianPayment';

function demoDate(value) {
    return formatCalendarDate(value);
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
    mollieUrl = '',
    paymentAnchor,
    fromVatNumber = '',
    toVatNumber = '',
    paperClassName = 'offacto-demo-paper',
}) {
    const brand = theme.primary || DEFAULT_BRAND_PRIMARY;
    const cssVars = themeCssVars(theme);
    const isCredit = documentType === 'credit';
    const sign = isCredit ? -1 : 1;

    const priced = visiblePreviewLines(items);
    const calcSubtotal = subtotalFromLines(priced);
    const subtotal = totalsOverride?.subtotal ?? calcSubtotal;
    const vat = totalsOverride?.tax ?? (intraEu ? 0 : vatAmount(calcSubtotal, vatRate));
    const total = totalsOverride?.total ?? totalAmount(subtotal, vat);
    const amountDue = intraEu ? subtotal : total;

    const title =
        documentType === 'quote'
            ? t('offers.doc_quotation')
            : documentType === 'credit'
              ? t('invoices.doc_credit')
              : t('invoices.doc_standard');

    const fromLine = [from.street, from.house].filter(Boolean).join(' ');
    const fromCity = [from.postal_code, from.city].filter(Boolean).join(' ');

    const lineTotal = (item) => lineAmount(item.quantity, item.price || item.unit_price);

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
                        {formatVatNumber(fromVatNumber) ? (
                            <>
                                <br />
                                {formatVatNumber(fromVatNumber)}
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
                {formatVatNumber(toVatNumber) ? (
                    <>
                        <br />
                        {formatVatNumber(toVatNumber)}
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
                                <td>
                                    <InvoiceLineLabel item={item} preferDescription={documentType === 'quote'} />
                                </td>
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
                    <span>{money(sign * (intraEu ? 0 : vat))}</span>
                </div>
                <div className="row total" style={{ color: brand }}>
                    <span>{isCredit ? t('invoices.preview_to_refund') : t('invoices.preview_amount_due')}</span>
                    <span>{money(sign * amountDue)}</span>
                </div>
            </div>

            {intraEu ? <div className="offacto-demo-paper-rc">{t('invoices.reverse_charge_short')}</div> : null}

            {!isCredit && documentType === 'invoice' ? (
                <InvoicePaymentBlock
                    dueDate={dueDate}
                    iban={iban}
                    structuredReference={structuredReference}
                    showMollieLink={showMollieLink}
                    mollieUrl={mollieUrl}
                    anchorId={paymentAnchor}
                    className="offacto-demo-paper-pt"
                />
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
