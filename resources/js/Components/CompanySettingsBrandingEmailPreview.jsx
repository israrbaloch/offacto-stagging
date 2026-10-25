import Logo from './Logo';
import { companyInvoiceLogoUrl } from '../lib/brand';
import { documentFontCssVar } from '../lib/documentFonts';
import { t } from '../lib/i18n';
import { money } from '../lib/utils';

export default function CompanySettingsBrandingEmailPreview({
    company,
    theme = {},
    logoPreview,
    invoiceLogoUrl,
    companySettings,
    showLogoInEmail = true,
    documentFont = 'inter',
}) {
    const primary = theme.primary || '#0e1250';
    const logoUrl = showLogoInEmail ? companyInvoiceLogoUrl({ logoPreview, invoiceLogoUrl, companySettings }) : null;
    const companyName = company?.company_name || t('company_settings.preview_company_fallback');
    const sampleTotal = money(2577.3);
    const sampleDue = money(2577.3);
    const addressLine = [company?.street, company?.house].filter(Boolean).join(' ');
    const cityLine = [company?.postal_code, company?.city].filter(Boolean).join(' ');

    return (
        <div className="offacto-settings-email-preview" style={documentFontCssVar(documentFont)}>
            <div className="offacto-settings-email-preview-subject">
                <span className="offacto-settings-email-preview-subject-lbl">{t('company_settings.email_preview_subject')}</span>
                <span>{t('company_settings.email_preview_subject_text', { number: '2026-0143', company: companyName })}</span>
            </div>
            <div className="offacto-settings-email-preview-head" style={{ background: primary }}>
                {logoUrl ? (
                    <img src={logoUrl} alt="" className="offacto-settings-email-preview-logo" />
                ) : (
                    <Logo className="offacto-settings-email-preview-logo-fallback" variant="white" />
                )}
                <div className="offacto-settings-email-preview-head-text">
                    <b>{companyName}</b>
                    {addressLine || cityLine ? (
                        <span>
                            {addressLine}
                            {cityLine ? (
                                <>
                                    <br />
                                    {cityLine}
                                </>
                            ) : null}
                        </span>
                    ) : null}
                </div>
            </div>
            <div className="offacto-settings-email-preview-body">
                <p className="offacto-settings-email-preview-greeting">{t('company_settings.email_preview_greeting')}</p>
                <p>{t('company_settings.email_preview_body', { number: '2026-0143' })}</p>
                <p className="offacto-settings-email-preview-muted">{t('company_settings.email_preview_body_extra')}</p>

                <div className="offacto-settings-email-preview-card">
                    <div className="offacto-settings-email-preview-card-row">
                        <span>{t('invoices.doc_standard')}</span>
                        <b>#2026-0143</b>
                    </div>
                    <div className="offacto-settings-email-preview-card-row">
                        <span>{t('company_settings.email_preview_invoice_date')}</span>
                        <b>21/10/2026</b>
                    </div>
                    <div className="offacto-settings-email-preview-card-row">
                        <span>{t('invoices.due_date')}</span>
                        <b>20/11/2026</b>
                    </div>
                    <div className="offacto-settings-email-preview-card-total" style={{ color: primary }}>
                        <span>{t('company_settings.email_preview_amount_due')}</span>
                        <b>{sampleDue}</b>
                    </div>
                </div>

                <button type="button" className="offacto-settings-email-preview-btn" style={{ background: primary }}>
                    {t('company_settings.email_preview_pay_cta', { amount: sampleTotal })}
                </button>
                <p className="offacto-settings-email-preview-footnote">{t('company_settings.email_preview_mollie_note')}</p>
            </div>
            <div className="offacto-settings-email-preview-footer">
                <span>{companyName}</span>
                {company?.email ? <span>{company.email}</span> : null}
                {company?.vat_number ? <span>{company.vat_number}</span> : null}
            </div>
        </div>
    );
}
