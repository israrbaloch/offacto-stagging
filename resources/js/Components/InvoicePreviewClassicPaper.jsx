import Logo from './Logo';
import DocumentPaperWave from './DocumentPaperWave';
import { DEFAULT_BRAND_PRIMARY, DEFAULT_BRAND_SECONDARY, themeCssVars } from '../lib/brand';
import { formatQuantityDisplay, lineIsHourly, priceColumnLabel, quantityColumnLabel } from '../lib/serviceBilling';
import { formatCalendarDate, money } from '../lib/utils';
import { t } from '../lib/i18n';
import InvoiceLineLabel, { visiblePreviewLines } from './InvoiceLineLabel';
import InvoicePaymentBlock from './InvoicePaymentBlock';
import { formatVatNumber } from '../lib/belgianPayment';

function demoDate(value) {
    return formatCalendarDate(value);
}

export default function InvoicePreviewClassicPaper({
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
    fromVatNumber = '',
    toVatNumber = '',
    iban = '',
    structuredReference = '',
    showMollieLink = false,
    mollieUrl = '',
    paymentAnchor,
}) {
    const primary = theme.primary || DEFAULT_BRAND_PRIMARY;
    const accent = theme.secondary || DEFAULT_BRAND_SECONDARY;
    const cssVars = themeCssVars(theme);

    const priced = visiblePreviewLines(items);
    const qtyHeader = quantityColumnLabel(items, []);
    const priceHeader = priceColumnLabel(items, []).replace(' (excl. VAT)', '');
    const calcSubtotal = priced.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || item.unit_price || 0),
        0,
    );
    const subtotal = totalsOverride?.subtotal ?? calcSubtotal;
    const vatAmount = totalsOverride?.tax ?? calcSubtotal * (Number(vatRate) / 100);
    const total = totalsOverride?.total ?? subtotal + vatAmount;

    const title =
        documentType === 'quote'
            ? t('offers.doc_quotation')
            : documentType === 'credit'
              ? t('invoices.doc_credit')
              : t('invoices.doc_standard');

    const fromLine = [from.street, from.house].filter(Boolean).join(' ');
    const fromCity = [from.postal_code, from.city].filter(Boolean).join(' ');

    const lineAmount = (item) => Number(item.quantity || 0) * Number(item.price ?? item.unit_price ?? 0);

    return (
        <div className="offacto-demo-paper offacto-demo-paper-classic" style={cssVars}>
            <div className="offacto-demo-paper-classic-body">
                <div className="offacto-demo-paper-head row">
                    <div>
                        {logoUrl ? (
                            <img src={logoUrl} alt="" className="offacto-demo-paper-logo" />
                        ) : (
                            <Logo className="offacto-demo-paper-logo-svg" />
                        )}
                    </div>
                    <div className="offacto-demo-paper-head-right">
                        <div className="offacto-demo-paper-classic-no">No. {number || '—'}</div>
                    </div>
                </div>

                <h2 className="offacto-demo-paper-classic-title">{title}</h2>
                <div className="offacto-demo-paper-classic-dates">
                    <span>
                        {t('invoices.preview_date')}: {demoDate(date)}
                    </span>
                    {documentType === 'quote' && validUntil ? (
                        <span>
                            {t('offers.valid_until_label')}: {demoDate(validUntil)}
                        </span>
                    ) : null}
                    {documentType === 'invoice' && dueDate ? (
                        <span>
                            {t('invoices.due_date')}: {demoDate(dueDate)}
                        </span>
                    ) : null}
                </div>

                <div className="offacto-demo-paper-classic-parties row">
                    <div>
                        <div className="offacto-demo-paper-billto-lbl">{t('invoices.preview_bill_to')}</div>
                        <b>{to.name || t('invoices.preview_client_pending')}</b>
                        {to.address ? (
                            <>
                                <br />
                                <span className="whitespace-pre-line offacto-demo-paper-muted">{to.address}</span>
                            </>
                        ) : null}
                        {formatVatNumber(toVatNumber) ? (
                            <>
                                <br />
                                <span className="offacto-demo-paper-muted">{formatVatNumber(toVatNumber)}</span>
                            </>
                        ) : null}
                    </div>
                    <div className="offacto-demo-paper-classic-from">
                        <div className="offacto-demo-paper-billto-lbl">{t('invoices.preview_from')}</div>
                        <b>{from.name || t('company_settings.preview_company_fallback')}</b>
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
                </div>

                <table className="offacto-demo-paper-classic-lines">
                    <thead>
                        <tr>
                            <th>{t('invoices.line_description')}</th>
                            <th className="num">{qtyHeader}</th>
                            <th className="num">{priceHeader}</th>
                            <th className="num">{t('invoices.line_total')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {priced.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="offacto-demo-paper-empty">
                                    {t('invoices.preview_no_lines')}
                                </td>
                            </tr>
                        ) : (
                            priced.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <InvoiceLineLabel item={item} preferDescription={documentType === 'quote'} />
                                    </td>
                                    <td className="num">{formatQuantityDisplay(item, [])}</td>
                                    <td className="num">
                                        {`${money(item.price ?? item.unit_price)}${lineIsHourly(item, []) ? '/h' : ''}`}
                                    </td>
                                    <td className="num">{money(lineAmount(item))}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="offacto-demo-paper-totals">
                    <div className="row">
                        <span>{t('invoices.subtotal')}</span>
                        <span>{money(subtotal)}</span>
                    </div>
                    <div className="row muted">
                        <span>
                            {t('invoices.vat')} ({vatRate}%)
                        </span>
                        <span>{money(vatAmount)}</span>
                    </div>
                    <div className="row total">
                        <span>{t('invoices.total')}</span>
                        <span>{money(total)}</span>
                    </div>
                </div>
                {documentType === 'invoice' ? (
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
            </div>
            <DocumentPaperWave primary={primary} secondary={accent} />
        </div>
    );
}
