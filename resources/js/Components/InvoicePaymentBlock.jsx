import { formatCalendarDate } from '../lib/utils';
import { formatIban } from '../lib/belgianPayment';
import { t } from '../lib/i18n';

export default function InvoicePaymentBlock({
    dueDate,
    iban = '',
    structuredReference = '',
    mollieUrl = '',
    showMollieLink = false,
    anchorId,
    className = 'offacto-demo-paper-pt',
}) {
    const formattedIban = formatIban(iban);
    const payOnline = showMollieLink && mollieUrl;

    if (!dueDate && !formattedIban && !structuredReference && !payOnline) {
        return null;
    }

    return (
        <div id={anchorId || undefined} className={className}>
            <div>
                {dueDate ? (
                    <div>
                        {t('invoices.preview_pay_before')} <b>{formatCalendarDate(dueDate)}</b>
                    </div>
                ) : null}
                {formattedIban ? (
                    <div>
                        {t('company_settings.iban')}: <b>{formattedIban}</b>
                    </div>
                ) : null}
                {structuredReference ? (
                    <div>
                        {t('invoices.structured_reference')}: <b>{structuredReference}</b>
                    </div>
                ) : null}
                {payOnline ? (
                    <a href={mollieUrl} className="offacto-demo-paper-mollie">
                        {t('invoices.pay_online')}
                    </a>
                ) : showMollieLink ? (
                    <div className="offacto-demo-paper-mollie">{t('invoices.preview_mollie_cta')}</div>
                ) : null}
            </div>
        </div>
    );
}
