import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Icon from '../../../Components/Icon';
import CompanyIntegrationsPanel from '../../../Components/CompanyIntegrationsPanel';
import CompanySettingsBrandingPanel from '../../../Components/CompanySettingsBrandingPanel';
import CompanySettingsLegalDocumentsPanel from '../../../Components/CompanySettingsLegalDocumentsPanel';
import CompanySettingsRemindersPanel from '../../../Components/CompanySettingsRemindersPanel';
import CompanySettingsVatPanel from '../../../Components/CompanySettingsVatPanel';
import NumberingSeriesEditor from '../../../Components/NumberingSeriesEditor';
import SelectMenu from '../../../Components/SelectMenu';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { useUi } from '../../../context/UiContext';
import { t } from '../../../lib/i18n';
import { optionsFromMap } from '../../../lib/utils';

function xsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

const fieldClass = 'offacto-time-inp';
const labelClass = 'offacto-settings-lbl';
const textareaClass = 'offacto-time-inp offacto-settings-textarea';

function formatStreetLine(street, house) {
    const h = house && house !== '-' ? house : '';
    return [street, h].filter(Boolean).join(' ').trim();
}

function parseStreetLine(line) {
    const trimmed = (line || '').trim();
    if (!trimmed) {
        return { street: '-', house: '-' };
    }
    const match = trimmed.match(/^(.+?)\s+(\S+)$/);
    if (match && /\d/.test(match[2])) {
        return { street: match[1].trim(), house: match[2] };
    }
    return { street: trimmed, house: '-' };
}

function formatPostalCity(postal, city) {
    return [postal, city].filter(Boolean).join(' ').trim();
}

function parsePostalCity(line) {
    const trimmed = (line || '').trim();
    const match = trimmed.match(/^(\S+)\s+(.+)$/);
    if (match) {
        return { postal_code: match[1], city: match[2].trim() };
    }
    return { postal_code: trimmed || '-', city: trimmed || '-' };
}

const NAV = [
    { id: 'company', icon: 'building', labelKey: 'company_settings.nav_company' },
    { id: 'branding', icon: 'spark', labelKey: 'company_settings.nav_branding' },
    { id: 'legal', icon: 'file', labelKey: 'company_settings.nav_legal' },
    { id: 'vat', icon: 'euro', labelKey: 'company_settings.nav_vat' },
    { id: 'numbering', icon: 'flag', labelKey: 'company_settings.nav_numbering' },
    { id: 'integrations', icon: 'link', labelKey: 'company_settings.nav_integrations' },
    { id: 'reminders', icon: 'bell', labelKey: 'company_settings.nav_reminders' },
    { id: 'team', icon: 'users', labelKey: 'company_settings.nav_team', comingSoon: true },
    { id: 'plan', icon: 'shield', labelKey: 'company_settings.nav_plan', comingSoon: true },
];

function Field({ label, error, children }) {
    return (
        <label className="offacto-time-field">
            <span className={labelClass}>{label}</span>
            {children}
            {error ? <span className="offacto-drawer-hint bad">{error}</span> : null}
        </label>
    );
}

function Panel({ title, description, headerExtra, children }) {
    return (
        <div className="offacto-dash-card offacto-settings-card">
            <div className="offacto-dash-card-head">
                <div>
                    <h3>{title}</h3>
                    {description ? <p className="offacto-settings-hint">{description}</p> : null}
                </div>
                {headerExtra || null}
            </div>
            <div className="offacto-dash-card-body offacto-settings-body">{children}</div>
        </div>
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`offacto-invoice-toggle${checked ? ' on' : ''}`}
        />
    );
}

export default function CompanySettingsIndex({
    section: initialSection = 'company',
    company,
    companySettings,
    invoiceLogoUrl,
    numberingSeriesList = [],
    activeNumberingSeriesId = null,
    languages = {},
    legalDocuments = [],
    integrations = {},
    integrationLinks = {},
    reminders = {},
    settingsBasePath = '/company/settings',
}) {
    const [section, setSection] = useState(initialSection);
    const [logoPreview, setLogoPreview] = useState(invoiceLogoUrl || null);
    const [streetLine, setStreetLine] = useState(() => formatStreetLine(company?.street, company?.house));
    const [postalCityLine, setPostalCityLine] = useState(() => formatPostalCity(company?.postal_code, company?.city));
    const [viesState, setViesState] = useState(null);
    const { toast } = useUi();

    useEffect(() => {
        setSection(initialSection);
    }, [initialSection]);

    useEffect(() => {
        if (invoiceLogoUrl) {
            setLogoPreview(invoiceLogoUrl);
        } else if (companySettings?.invoice_logo) {
            setLogoPreview(`/storage/${String(companySettings.invoice_logo).replace(/^\/+/, '')}`);
        }
    }, [invoiceLogoUrl, companySettings?.invoice_logo]);

    useEffect(() => {
        setLogoPreview(invoiceLogoUrl || null);
    }, [company?.id]);

    useEffect(() => {
        if (!company) {
            return;
        }
        setStreetLine(formatStreetLine(company.street, company.house));
        setPostalCityLine(formatPostalCity(company.postal_code, company.city));
    }, [company?.id, company?.street, company?.house, company?.postal_code, company?.city]);

    const goSection = (id) => {
        setSection(id);
        router.get('/company/settings', { section: id }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const companyForm = useForm({
        company_name: company?.company_name || '',
        first_name: company?.first_name || '',
        surname: company?.surname || '',
        email: company?.email || '',
        phone: company?.phone || '',
        vat_number: company?.vat_number || '',
        street: company?.street || '',
        house: company?.house || '',
        postal_code: company?.postal_code || '',
        city: company?.city || '',
        language: company?.language || '',
        self_employed_activity: company?.self_employed_activity || '',
        iban: companySettings?.iban || '',
    });

    const brandingForm = useForm({
        theme: {
            primary: companySettings?.theme?.primary || '#4054b2',
            secondary: companySettings?.theme?.secondary || '#94a3b8',
        },
        invoice_template: companySettings?.invoice_template || 'classic',
        document_font: companySettings?.document_font || 'inter',
        invoice_logo: null,
        logo_in_emails: companySettings?.logo_in_emails ?? true,
    });

    const runCompanyVies = async () => {
        const vat = companyForm.data.vat_number?.trim();
        if (!vat) {
            setViesState('invalid');
            toast.error(t('customers.vies_invalid'));
            return;
        }

        setViesState('checking');

        try {
            const res = await fetch('/customers/vies-validate', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ vat_number: vat }),
            });

            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                setViesState('invalid');
                toast.error(
                    payload?.errors?.vat_number?.[0] || payload?.message || t('customers.vies_service_unavailable'),
                );
                return;
            }

            const result = payload?.data;
            if (!result?.valid) {
                setViesState('invalid');
                toast.error(t('customers.vies_not_registered'));
                return;
            }

            setViesState('valid');
            if (result.vat_number) {
                companyForm.setData('vat_number', result.vat_number);
            }
            toast.success(t('company_settings.vies_valid_kbo'));
        } catch {
            setViesState('invalid');
            toast.error(t('customers.vies_service_unavailable'));
        }
    };

    const saveCompany = (e) => {
        e.preventDefault();
        const streetParts = parseStreetLine(streetLine);
        const postalParts = parsePostalCity(postalCityLine);
        companyForm.transform((data) => ({
            ...data,
            ...streetParts,
            ...postalParts,
            house: streetParts.house?.trim() || '-',
        }));
        companyForm.patch(`${settingsBasePath}/company`);
    };

    const brandingThemePayload = (theme) => {
        const primary = theme?.primary || '#4054b2';
        return { primary, secondary: primary };
    };

    const buildBrandingFormData = (next, file = null) => {
        const theme = brandingThemePayload(next.theme);
        const fd = new FormData();
        fd.append('theme[primary]', theme.primary);
        fd.append('theme[secondary]', theme.secondary);
        fd.append('invoice_template', next.invoice_template || 'classic');
        fd.append('document_font', next.document_font || 'inter');
        fd.append('logo_in_emails', next.logo_in_emails ? '1' : '0');
        if (file instanceof File) {
            fd.append('invoice_logo', file, file.name);
        }
        return fd;
    };

    const saveBranding = (extra = {}) => {
        const next = { ...brandingForm.data, ...extra };
        brandingForm.setData(next);
        const uploadFile = extra.invoice_logo instanceof File ? extra.invoice_logo : null;

        if (extra.remove_invoice_logo) {
            brandingForm.transform(() => ({
                theme: brandingThemePayload(next.theme),
                invoice_template: next.invoice_template,
                document_font: next.document_font,
                logo_in_emails: next.logo_in_emails,
                remove_invoice_logo: true,
            }));
            brandingForm.patch(`${settingsBasePath}/branding`, {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setLogoPreview(null);
                },
            });
            return;
        }

        if (uploadFile) {
            router.post(`${settingsBasePath}/branding`, buildBrandingFormData(next, uploadFile), {
                forceFormData: true,
                preserveScroll: true,
                preserveState: false,
                onSuccess: (page) => {
                    brandingForm.setData('invoice_logo', null);
                    const savedUrl = page?.props?.invoiceLogoUrl;
                    if (savedUrl) {
                        setLogoPreview(savedUrl);
                    }
                },
                onError: (errors) => {
                    const first = Object.values(errors || {})[0];
                    toast.error(typeof first === 'string' ? first : Array.isArray(first) ? first[0] : 'Could not save logo.');
                },
            });
            return;
        }

        brandingForm.transform(() => ({
            theme: brandingThemePayload(next.theme),
            invoice_template: next.invoice_template,
            document_font: next.document_font,
            logo_in_emails: next.logo_in_emails,
        }));
        brandingForm.patch(`${settingsBasePath}/branding`, {
            preserveScroll: true,
            onSuccess: () => {
                brandingForm.setData('invoice_logo', null);
            },
        });
    };

    const legalBase = `${settingsBasePath}/legal-documents`;

    return (
        <AuthenticatedLayout title={t('company_settings.title')}>
            <div className="offacto-briefings offacto-dash offacto-settings-page">
                <header className="offacto-brief-edit-ph">
                    <div>
                        <h1>{t('company_settings.title')}</h1>
                        <p>{company?.company_name || t('company_settings.subtitle')}</p>
                    </div>
                </header>

                <div className="offacto-settings-grid">
                    <nav className="offacto-dash-card offacto-setnav" aria-label={t('company_settings.title')}>
                        {NAV.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    if (item.comingSoon) {
                                        toast.info(t('nav.coming_soon'));
                                        return;
                                    }
                                    goSection(item.id);
                                }}
                                className={section === item.id ? 'on' : ''}
                            >
                                <Icon name={item.icon} />
                                {t(item.labelKey)}
                            </button>
                        ))}
                    </nav>

                    <div className="offacto-settings-main">
                        {section === 'company' && (
                            <Panel title={t('company_settings.nav_company')} description={t('company_settings.company_desc')}>
                                <form onSubmit={saveCompany} className="offacto-settings-fg">
                                    <div className="offacto-settings-fg2">
                                        <Field label={t('company_settings.org_name')} error={companyForm.errors.company_name}>
                                            <input className={fieldClass} value={companyForm.data.company_name} onChange={(e) => companyForm.setData('company_name', e.target.value)} />
                                        </Field>
                                        <Field label={t('companies.vat')} error={companyForm.errors.vat_number}>
                                            <div className="offacto-settings-inrow">
                                                <div className={`offacto-settings-inp-wrap${viesState === 'valid' ? ' is-valid' : ''}`}>
                                                    <input
                                                        className={fieldClass}
                                                        value={companyForm.data.vat_number}
                                                        onChange={(e) => {
                                                            companyForm.setData('vat_number', e.target.value);
                                                            setViesState(null);
                                                        }}
                                                        aria-invalid={viesState === 'invalid'}
                                                    />
                                                    {viesState === 'valid' ? (
                                                        <Icon name="check" className="offacto-settings-inp-check" aria-hidden />
                                                    ) : null}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="offacto-settings-vies-btn"
                                                    onClick={runCompanyVies}
                                                    disabled={viesState === 'checking'}
                                                >
                                                    {viesState === 'checking' ? t('customers.vies_checking') : 'VIES'}
                                                </button>
                                            </div>
                                        </Field>
                                    </div>
                                    <div className="offacto-settings-fg2">
                                        <Field label={t('profile.company_email')} error={companyForm.errors.email}>
                                            <input type="email" className={fieldClass} value={companyForm.data.email} onChange={(e) => companyForm.setData('email', e.target.value)} />
                                        </Field>
                                        <Field label={t('profile.company_phone')} error={companyForm.errors.phone}>
                                            <input className={fieldClass} value={companyForm.data.phone} onChange={(e) => companyForm.setData('phone', e.target.value)} />
                                        </Field>
                                    </div>
                                    <div className="offacto-settings-fg2">
                                        <Field label={t('company_settings.street_and_number')} error={companyForm.errors.street || companyForm.errors.house}>
                                            <input className={fieldClass} value={streetLine} onChange={(e) => setStreetLine(e.target.value)} />
                                        </Field>
                                        <Field label={t('company_settings.postcode_and_city')} error={companyForm.errors.postal_code || companyForm.errors.city}>
                                            <input className={fieldClass} value={postalCityLine} onChange={(e) => setPostalCityLine(e.target.value)} />
                                        </Field>
                                    </div>
                                    <div className="offacto-settings-fg2">
                                        <Field label={t('company_settings.iban')} error={companyForm.errors.iban}>
                                            <input
                                                className={fieldClass}
                                                value={companyForm.data.iban}
                                                onChange={(e) => companyForm.setData('iban', e.target.value)}
                                                placeholder="BE68 5390 0754 7034"
                                            />
                                        </Field>
                                        <Field label={t('company_settings.document_language')} error={companyForm.errors.language}>
                                            <SelectMenu
                                                value={companyForm.data.language}
                                                onChange={(e) => companyForm.setData('language', e.target.value)}
                                                options={optionsFromMap(languages)}
                                                placeholder={t('common.select')}
                                                variant="demo"
                                            />
                                        </Field>
                                    </div>
                                    <div className="offacto-settings-save">
                                        <button type="submit" disabled={companyForm.processing} className="offacto-btn-p">
                                            {companyForm.processing ? t('common.saving') : t('common.save')}
                                        </button>
                                    </div>
                                </form>
                            </Panel>
                        )}

                        {section === 'branding' && (
                            <Panel
                                title={t('company_settings.nav_branding')}
                                description={t('company_settings.branding_desc')}
                                headerExtra={
                                    <span className="offacto-settings-live-badge">
                                        <Icon name="eye" />
                                        {t('company_settings.live_preview')}
                                    </span>
                                }
                            >
                                <CompanySettingsBrandingPanel
                                    brandingForm={brandingForm}
                                    logoPreview={logoPreview}
                                    setLogoPreview={setLogoPreview}
                                    saveBranding={saveBranding}
                                    company={company}
                                    companySettings={companySettings}
                                    invoiceLogoUrl={invoiceLogoUrl}
                                />
                            </Panel>
                        )}

                        {section === 'numbering' && (
                            <Panel title={t('numbering.title')} description={t('company_settings.numbering_desc')}>
                                <div className="offacto-settings-embed">
                                    <NumberingSeriesEditor series={numberingSeriesList} activeSeriesId={activeNumberingSeriesId} company={company} settingsBasePath={settingsBasePath} />
                                </div>
                            </Panel>
                        )}

                        {section === 'integrations' && (
                            <Panel title={t('integrations.title')}>
                                <CompanyIntegrationsPanel integrations={integrations} links={integrationLinks} settingsBasePath={settingsBasePath} />
                            </Panel>
                        )}

                        {section === 'reminders' && (
                            <CompanySettingsRemindersPanel reminders={reminders} settingsBasePath={settingsBasePath} />
                        )}

                        {section === 'legal' && (
                            <Panel title={t('company_settings.legal_title')} description={t('company_settings.legal_desc')}>
                                <CompanySettingsLegalDocumentsPanel legalDocuments={legalDocuments} legalBase={legalBase} />
                            </Panel>
                        )}

                        {section === 'vat' && (
                            <Panel title={t('company_settings.nav_vat')}>
                                <CompanySettingsVatPanel
                                    vatRegime={company?.vat_regime}
                                    settingsBasePath={settingsBasePath}
                                />
                            </Panel>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
