import { Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Icon from '../../../Components/Icon';
import CompanyIntegrationsPanel from '../../../Components/CompanyIntegrationsPanel';
import NumberingSeriesEditor from '../../../Components/NumberingSeriesEditor';
import SelectMenu from '../../../Components/SelectMenu';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { t } from '../../../lib/i18n';
import { optionsFromMap } from '../../../lib/utils';

const fieldClass =
    'w-full rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';
const textareaClass =
    'w-full min-h-[140px] resize-y rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100';

const NAV = [
    { id: 'company', icon: 'building', labelKey: 'company_settings.nav_company' },
    { id: 'branding', icon: 'palette', labelKey: 'company_settings.nav_branding' },
    { id: 'numbering', icon: 'document', labelKey: 'company_settings.nav_numbering' },
    { id: 'integrations', icon: 'settings', labelKey: 'company_settings.nav_integrations' },
    { id: 'reminders', icon: 'clock', labelKey: 'company_settings.nav_reminders' },
    { id: 'legal', icon: 'scale', labelKey: 'company_settings.nav_legal' },
    { id: 'terms', icon: 'document', labelKey: 'company_settings.nav_terms' },
];

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className={labelClass}>{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
        </label>
    );
}

function Panel({ title, description, children }) {
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5 sm:px-8">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
                {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>}
            </div>
            <div className="px-6 py-6 sm:px-8">{children}</div>
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
        >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-5' : 'left-0.5'}`} />
        </button>
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
    termsContent = { en: '', fr: '', nl: '' },
    settingsBasePath = '/company/settings',
}) {
    const [section, setSection] = useState(initialSection);
    const [logoPreview, setLogoPreview] = useState(invoiceLogoUrl || null);

    useEffect(() => {
        setSection(initialSection);
    }, [initialSection]);

    useEffect(() => {
        setLogoPreview(invoiceLogoUrl || null);
    }, [invoiceLogoUrl]);

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
    });

    const brandingForm = useForm({
        theme: {
            primary: companySettings?.theme?.primary || '#4054b2',
            secondary: companySettings?.theme?.secondary || '#94a3b8',
        },
        invoice_logo: null,
        logo_in_emails: companySettings?.logo_in_emails ?? true,
    });

    const remindersForm = useForm({
        automated_reminders_enabled: reminders.automated_reminders_enabled ?? true,
        schedule: (reminders.schedule || [7, 14, 30]).join(', '),
        grace_days: reminders.grace_days ?? 0,
        escalation: reminders.escalation || '',
    });

    const termsForm = useForm({
        terms_content: { ...termsContent },
    });

    const saveCompany = (e) => {
        e.preventDefault();
        companyForm.transform((data) => ({
            ...data,
            house: data.house?.trim() || '-',
        }));
        companyForm.patch(`${settingsBasePath}/company`);
    };

    const saveBranding = (extra = {}) => {
        const uploadFile = extra.invoice_logo instanceof File ? extra.invoice_logo : null;
        if (uploadFile) {
            brandingForm.setData('invoice_logo', uploadFile);
        } else {
            Object.entries(extra).forEach(([key, value]) => brandingForm.setData(key, value));
        }
        const hasFile = uploadFile instanceof File || brandingForm.data.invoice_logo instanceof File;
        brandingForm.patch(`${settingsBasePath}/branding`, {
            forceFormData: hasFile,
            preserveScroll: true,
            onSuccess: () => {
                brandingForm.setData('invoice_logo', null);
                router.reload({ preserveScroll: true });
            },
        });
    };

    const saveReminders = (e) => {
        e.preventDefault();
        const days = remindersForm.data.schedule
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !Number.isNaN(n) && n > 0);
        router.patch(
            `${settingsBasePath}/reminders`,
            {
                automated_reminders_enabled: remindersForm.data.automated_reminders_enabled,
                schedule: days.length ? days : [7, 14, 30],
                grace_days: Number(remindersForm.data.grace_days) || 0,
                escalation: remindersForm.data.escalation,
            },
            { preserveScroll: true },
        );
    };

    const saveTerms = (e) => {
        e.preventDefault();
        termsForm.patch(`${settingsBasePath}/terms`, { preserveScroll: true });
    };

    const typeLabel = {
        terms: t('profile.terms'),
        contract: t('profile.contract'),
        other: t('profile.other'),
    };

    const legalBase = `${settingsBasePath}/legal-documents`;

    return (
        <AuthenticatedLayout title={t('company_settings.title')}>
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{company?.company_name || t('company_settings.eyebrow')}</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{t('company_settings.title')}</h1>
                        <p className="mt-2 max-w-xl text-sm text-slate-500">{t('company_settings.subtitle')}</p>
                    </div>
                    <Link href="/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                        ← {t('company_settings.back_profile')}
                    </Link>
                </header>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <nav className="lg:w-56 lg:shrink-0">
                        <div className="sticky top-6 space-y-1 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
                            {NAV.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => goSection(item.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                                        section === item.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon name={item.icon} className="h-4 w-4 shrink-0 opacity-80" />
                                    {t(item.labelKey)}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div className="min-w-0 flex-1 space-y-8">
                        {section === 'company' && (
                            <Panel title={t('profile.company_info')} description={t('company_settings.company_desc')}>
                                <form onSubmit={saveCompany} className="space-y-5">
                                    <Field label={t('companies.name')} error={companyForm.errors.company_name}>
                                        <input className={fieldClass} value={companyForm.data.company_name} onChange={(e) => companyForm.setData('company_name', e.target.value)} />
                                    </Field>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label={t('companies.first_name')} error={companyForm.errors.first_name}>
                                            <input className={fieldClass} value={companyForm.data.first_name} onChange={(e) => companyForm.setData('first_name', e.target.value)} />
                                        </Field>
                                        <Field label={t('companies.surname')} error={companyForm.errors.surname}>
                                            <input className={fieldClass} value={companyForm.data.surname} onChange={(e) => companyForm.setData('surname', e.target.value)} />
                                        </Field>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label={t('profile.company_email')} error={companyForm.errors.email}>
                                            <input type="email" className={fieldClass} value={companyForm.data.email} onChange={(e) => companyForm.setData('email', e.target.value)} />
                                        </Field>
                                        <Field label={t('profile.company_phone')} error={companyForm.errors.phone}>
                                            <input className={fieldClass} value={companyForm.data.phone} onChange={(e) => companyForm.setData('phone', e.target.value)} />
                                        </Field>
                                    </div>
                                    <Field label={t('companies.vat')} error={companyForm.errors.vat_number}>
                                        <input className={fieldClass} value={companyForm.data.vat_number} onChange={(e) => companyForm.setData('vat_number', e.target.value)} />
                                    </Field>
                                    <div className="border-t border-slate-100 pt-4">
                                        <p className="mb-3 text-sm font-medium text-slate-800">{t('companies.address')}</p>
                                        <div className="space-y-4">
                                            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                                                <Field label={t('companies.street')} error={companyForm.errors.street}>
                                                    <input className={fieldClass} value={companyForm.data.street} onChange={(e) => companyForm.setData('street', e.target.value)} />
                                                </Field>
                                                <Field label={t('companies.house')} error={companyForm.errors.house}>
                                                    <input className={fieldClass} value={companyForm.data.house} onChange={(e) => companyForm.setData('house', e.target.value)} />
                                                </Field>
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <Field label={t('companies.postal')} error={companyForm.errors.postal_code}>
                                                    <input className={fieldClass} value={companyForm.data.postal_code} onChange={(e) => companyForm.setData('postal_code', e.target.value)} />
                                                </Field>
                                                <Field label={t('companies.city')} error={companyForm.errors.city}>
                                                    <input className={fieldClass} value={companyForm.data.city} onChange={(e) => companyForm.setData('city', e.target.value)} />
                                                </Field>
                                            </div>
                                            <Field label={t('companies.language')} error={companyForm.errors.language}>
                                                <SelectMenu
                                                    value={companyForm.data.language}
                                                    onChange={(e) => companyForm.setData('language', e.target.value)}
                                                    options={optionsFromMap(languages)}
                                                    placeholder={t('common.select')}
                                                    className={fieldClass}
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                    <div className="flex justify-end border-t border-slate-100 pt-4">
                                        <button type="submit" disabled={companyForm.processing} className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                                            {t('profile.save_company')}
                                        </button>
                                    </div>
                                </form>
                            </Panel>
                        )}

                        {section === 'branding' && (
                            <Panel title={t('profile.branding')} description={t('company_settings.branding_desc')}>
                                <div className="space-y-5">
                                    <div>
                                        <span className={labelClass}>{t('profile.logo')}</span>
                                        <label className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-8 text-center hover:border-indigo-300">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="" className="mb-3 max-h-16 w-auto object-contain" />
                                            ) : (
                                                <Icon name="upload" className="mb-2 h-8 w-8 text-indigo-500" />
                                            )}
                                            <span className="text-sm font-medium text-indigo-700">{t('profile.upload')}</span>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setLogoPreview(URL.createObjectURL(file));
                                                    saveBranding({ invoice_logo: file });
                                                }}
                                            />
                                        </label>
                                        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
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
                                        <span className={labelClass}>{t('profile.theme_colors')}</span>
                                        <div className="mt-2 space-y-3">
                                            {['primary', 'secondary'].map((key) => (
                                                <label key={key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                                                    <span className="text-sm text-slate-700">{key === 'primary' ? t('profile.primary') : t('profile.accent')}</span>
                                                    <input
                                                        type="color"
                                                        className="h-8 w-8 cursor-pointer rounded-full border-0"
                                                        value={brandingForm.data.theme[key]}
                                                        onChange={(e) => brandingForm.setData('theme', { ...brandingForm.data.theme, [key]: e.target.value })}
                                                        onBlur={() => saveBranding()}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        )}

                        {section === 'numbering' && (
                            <Panel title={t('numbering.title')} description={t('company_settings.numbering_desc')}>
                                <NumberingSeriesEditor series={numberingSeriesList} activeSeriesId={activeNumberingSeriesId} company={company} settingsBasePath={settingsBasePath} />
                            </Panel>
                        )}

                        {section === 'integrations' && (
                            <Panel title={t('integrations.title')} description={t('company_settings.integrations_desc')}>
                                <CompanyIntegrationsPanel integrations={integrations} links={integrationLinks} settingsBasePath={settingsBasePath} />
                            </Panel>
                        )}

                        {section === 'reminders' && (
                            <Panel title={t('company_settings.reminders_title')} description={t('company_settings.reminders_desc')}>
                                <form onSubmit={saveReminders} className="space-y-5">
                                    <div className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{t('company_settings.reminders_enabled')}</p>
                                            <p className="text-xs text-slate-500">{t('company_settings.reminders_enabled_hint')}</p>
                                        </div>
                                        <Toggle
                                            checked={!!remindersForm.data.automated_reminders_enabled}
                                            onChange={(v) => remindersForm.setData('automated_reminders_enabled', v)}
                                        />
                                    </div>
                                    <Field label={t('company_settings.reminder_schedule')} error={remindersForm.errors.schedule}>
                                        <input className={fieldClass} value={remindersForm.data.schedule} onChange={(e) => remindersForm.setData('schedule', e.target.value)} placeholder="7, 14, 30" />
                                        <p className="mt-1 text-xs text-slate-500">{t('company_settings.reminder_schedule_hint')}</p>
                                    </Field>
                                    <Field label={t('company_settings.reminder_grace')} error={remindersForm.errors.grace_days}>
                                        <input type="number" min={0} max={90} className={fieldClass} value={remindersForm.data.grace_days} onChange={(e) => remindersForm.setData('grace_days', e.target.value)} />
                                    </Field>
                                    <Field label={t('company_settings.reminder_escalation')} error={remindersForm.errors.escalation}>
                                        <textarea className={textareaClass} value={remindersForm.data.escalation} onChange={(e) => remindersForm.setData('escalation', e.target.value)} />
                                    </Field>
                                    <div className="flex justify-end border-t border-slate-100 pt-4">
                                        <button type="submit" className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">
                                            {t('company_settings.save_reminders')}
                                        </button>
                                    </div>
                                </form>
                            </Panel>
                        )}

                        {section === 'legal' && (
                            <Panel title={t('company_settings.legal_title')} description={t('company_settings.legal_desc')}>
                                <p className="mb-4 text-sm text-slate-600">
                                    {t('company_settings.legal_unlimited', { count: legalDocuments.length })}
                                </p>
                                <ul className="space-y-3">
                                    {legalDocuments.length === 0 && (
                                        <li className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                            {t('company_settings.legal_empty')}
                                        </li>
                                    )}
                                    {legalDocuments.map((doc) => (
                                        <li key={doc.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-slate-900">
                                                        {doc.title || typeLabel[doc.type] || doc.original_name}
                                                    </div>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                        <span className="rounded-md bg-white px-1.5 py-0.5">{typeLabel[doc.type] || doc.type}</span>
                                                        <span className="truncate">{doc.original_name}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`${legalBase}/${doc.id}/download`}
                                                        className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-sm hover:bg-indigo-50"
                                                    >
                                                        {t('company_settings.legal_download')}
                                                    </a>
                                                    <button
                                                        type="button"
                                                        className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-rose-600"
                                                        onClick={() => router.delete(`${legalBase}/${doc.id}`, { preserveScroll: true })}
                                                        aria-label={t('common.delete')}
                                                    >
                                                        <Icon name="trash" className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between border-t border-indigo-100/80 pt-3">
                                                <span className="text-xs font-medium text-slate-600">{t('profile.attach_quotes')}</span>
                                                <Toggle
                                                    checked={!!doc.attach_to_quotes_default}
                                                    onChange={(checked) => router.patch(`${legalBase}/${doc.id}`, { attach_to_quotes_default: checked }, { preserveScroll: true })}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        {legalDocuments.length === 0 ? t('profile.add_legal') : t('company_settings.legal_add_another')}
                                    </h3>
                                    <form
                                        className="mt-4 space-y-3"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const formEl = e.currentTarget;
                                            const data = new FormData(formEl);
                                            if (formEl.attach_to_quotes_default?.checked) {
                                                data.set('attach_to_quotes_default', '1');
                                            }
                                            router.post(legalBase, data, {
                                                forceFormData: true,
                                                preserveScroll: true,
                                                onSuccess: () => formEl.reset(),
                                            });
                                        }}
                                    >
                                        <Field label={t('company_settings.legal_title_field')}>
                                            <input name="title" className={fieldClass} placeholder={t('company_settings.legal_title_placeholder')} />
                                        </Field>
                                        <Field label={t('company_settings.legal_type')}>
                                            <select name="type" className={fieldClass} defaultValue="terms">
                                                <option value="terms">{t('profile.terms')}</option>
                                                <option value="contract">{t('profile.contract')}</option>
                                                <option value="other">{t('profile.other')}</option>
                                            </select>
                                        </Field>
                                        <Field label={t('company_settings.legal_file')}>
                                            <input name="file" type="file" accept="application/pdf" required className={fieldClass} />
                                        </Field>
                                        <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input type="checkbox" name="attach_to_quotes_default" value="1" />
                                            {t('profile.attach_default')}
                                        </label>
                                        <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                                            {t('profile.upload_pdf')}
                                        </button>
                                    </form>
                                </div>
                            </Panel>
                        )}

                        {section === 'terms' && (
                            <Panel title={t('company_settings.terms_title')} description={t('company_settings.terms_desc')}>
                                <form onSubmit={saveTerms} className="space-y-6">
                                    {['en', 'nl', 'fr'].map((locale) => (
                                        <label key={locale} className="block">
                                            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs uppercase">{locale}</span>
                                                {t('company_settings.terms_body')}
                                            </span>
                                            <textarea
                                                className={textareaClass}
                                                value={termsForm.data.terms_content[locale] || ''}
                                                onChange={(e) =>
                                                    termsForm.setData('terms_content', {
                                                        ...termsForm.data.terms_content,
                                                        [locale]: e.target.value,
                                                    })
                                                }
                                            />
                                        </label>
                                    ))}
                                    <p className="text-xs text-slate-500">{t('company_settings.terms_hint')}</p>
                                    <div className="flex justify-end border-t border-slate-100 pt-4">
                                        <button type="submit" disabled={termsForm.processing} className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                                            {t('company_settings.save_terms')}
                                        </button>
                                    </div>
                                </form>
                            </Panel>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
