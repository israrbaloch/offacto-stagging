import { useMemo } from 'react';
import Icon from './Icon';
import SelectMenu from './SelectMenu';
import InvoiceDocumentPreview from './InvoiceDocumentPreview';
import CompanySettingsBrandingEmailPreview from './CompanySettingsBrandingEmailPreview';
import CompanySettingsBrandingCustomTemplatesCta from './CompanySettingsBrandingCustomTemplatesCta';
import { companyInvoiceLogoUrl } from '../lib/brand';
import { DOCUMENT_FONT_OPTIONS, documentFontCssVar, documentFontFamily } from '../lib/documentFonts';
import { t } from '../lib/i18n';

const BRAND_SWATCHES = ['#3A4AA0', '#0F766E', '#B4235A', '#C2410C', '#141A3A', '#7C3AED'];

const TEMPLATE_OPTIONS = [
    { id: 'modern', labelKey: 'invoices.template_modern' },
    { id: 'classic', labelKey: 'invoices.template_classic' },
    { id: 'minimal', labelKey: 'invoices.template_minimal' },
];

const labelClass = 'offacto-settings-lbl';

export default function CompanySettingsBrandingPanel({
    brandingForm,
    logoPreview,
    setLogoPreview,
    saveBranding,
    company,
    companySettings,
    invoiceLogoUrl,
}) {
    const fontStyle = documentFontCssVar(brandingForm.data.document_font);

    const previewProps = useMemo(
        () => ({
            number: '2026-0143',
            date: '2026-10-21',
            dueDate: '2026-11-20',
            from: {
                name: company?.company_name || t('company_settings.preview_company_fallback'),
                street: company?.street,
                house: company?.house,
                postal_code: company?.postal_code,
                city: company?.city,
            },
            fromVatNumber: company?.vat_number || '',
            to: {
                name: t('company_settings.preview_client_name'),
                address: t('company_settings.preview_client_address'),
            },
            toVatNumber: 'BE0456.789.012',
            items: [
                { description: t('company_settings.preview_line_1'), quantity: 12, price: 95 },
                { description: t('company_settings.preview_line_2'), quantity: 1, price: 650 },
            ],
            vatRate: 21,
            logoUrl: companyInvoiceLogoUrl({ logoPreview, invoiceLogoUrl, companySettings }) || undefined,
            iban: companySettings?.iban || 'BE68 5390 0754 7034',
            structuredReference: '+++142/2026/00087+++',
            showMollieLink: true,
            theme: brandingForm.data.theme,
        }),
        [
            company,
            companySettings?.iban,
            logoPreview,
            invoiceLogoUrl,
            companySettings,
            brandingForm.data.theme,
            brandingForm.data.invoice_template,
        ],
    );

    const hasLogo = Boolean(
        logoPreview || invoiceLogoUrl || companySettings?.invoice_logo,
    );

    const fontOptions = DOCUMENT_FONT_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(opt.labelKey),
        fontFamily: documentFontFamily(opt.value),
    }));

    return (
        <div className="offacto-settings-brand-wrap" style={fontStyle}>
            <div className="offacto-settings-brand-grid">
                <div className="offacto-settings-brand-controls offacto-settings-fg">
                    <div>
                        <span className={labelClass}>{t('profile.logo')}</span>
                        <label className="offacto-settings-drop">
                            {logoPreview ? (
                                <img src={logoPreview} alt="" className="offacto-settings-logo" />
                            ) : (
                                <Icon name="up" />
                            )}
                            <b>{t('company_settings.replace_logo')}</b>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) {
                                        return;
                                    }
                                    setLogoPreview(URL.createObjectURL(file));
                                    saveBranding({ invoice_logo: file });
                                }}
                            />
                        </label>
                        {hasLogo ? (
                            <button
                                type="button"
                                className="offacto-settings-remove-logo"
                                onClick={() => saveBranding({ remove_invoice_logo: true })}
                            >
                                {t('company_settings.remove_logo')}
                            </button>
                        ) : null}
                        <label className="offacto-settings-check">
                            <input
                                type="checkbox"
                                checked={!!brandingForm.data.logo_in_emails}
                                onChange={(e) => {
                                    brandingForm.setData('logo_in_emails', e.target.checked);
                                    saveBranding({ logo_in_emails: e.target.checked });
                                }}
                            />
                            {t('profile.logo_in_emails')}
                        </label>
                    </div>
                    <div>
                        <span className={labelClass}>{t('profile.primary')}</span>
                        <div className="offacto-settings-swatches">
                            {BRAND_SWATCHES.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`offacto-settings-swatch${brandingForm.data.theme.primary?.toLowerCase() === color.toLowerCase() ? ' on' : ''}`}
                                    style={{ background: color }}
                                    aria-label={color}
                                    onClick={() => {
                                        const theme = { primary: color, secondary: color };
                                        brandingForm.setData('theme', theme);
                                        saveBranding({ theme });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className={labelClass}>{t('company_settings.document_font')}</span>
                        <SelectMenu
                            variant="demo"
                            value={brandingForm.data.document_font || 'inter'}
                            onChange={(e) => {
                                const document_font = e.target.value;
                                brandingForm.setData('document_font', document_font);
                                saveBranding({ document_font });
                            }}
                            options={fontOptions}
                            allowEmpty={false}
                            className="offacto-settings-font-select"
                            style={{
                                fontFamily: documentFontFamily(brandingForm.data.document_font || 'inter'),
                            }}
                        />
                        <p className="offacto-settings-hint">{t('company_settings.document_font_hint')}</p>
                    </div>
                    <div>
                        <span className={labelClass}>{t('invoices.template_picker_label')}</span>
                        <div className="offacto-dash-tabs offacto-settings-tabs">
                            {TEMPLATE_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={brandingForm.data.invoice_template === option.id ? 'on' : ''}
                                    onClick={() => {
                                        brandingForm.setData('invoice_template', option.id);
                                        saveBranding({ invoice_template: option.id });
                                    }}
                                >
                                    {t(option.labelKey)}
                                </button>
                            ))}
                        </div>
                        <p className="offacto-settings-hint">{t('company_settings.invoice_template_hint')}</p>
                    </div>
                    <div>
                        <span className={labelClass}>{t('company_settings.email_style')}</span>
                        <CompanySettingsBrandingEmailPreview
                            company={company}
                            theme={brandingForm.data.theme}
                            logoPreview={logoPreview}
                            invoiceLogoUrl={invoiceLogoUrl}
                            companySettings={companySettings}
                            showLogoInEmail={!!brandingForm.data.logo_in_emails}
                            documentFont={brandingForm.data.document_font || 'inter'}
                        />
                    </div>
                </div>
                <div className="offacto-settings-brand-preview offacto-settings-doc-font">
                    <InvoiceDocumentPreview template={brandingForm.data.invoice_template} {...previewProps} />
                </div>
            </div>
            <CompanySettingsBrandingCustomTemplatesCta />
        </div>
    );
}
