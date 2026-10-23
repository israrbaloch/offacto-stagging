import { Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../../Components/Icon';
import AuthSplitLayout, {
    authHeadingClass,
    authInputClass,
    authLabelClass,
    authLinkClass,
    authRegisterBackButtonClass,
    authRegisterNextButtonClass,
    authRegisterOutlineButtonClass,
    authSubClass,
} from '../../Layouts/AuthSplitLayout';
import { useUi } from '../../context/UiContext';
import { t } from '../../lib/i18n';

const LEGAL_FORM_OPTIONS = [
    { value: 'vzw', labelKey: 'auth.legal_form_vzw' },
    { value: 'bv', labelKey: 'auth.legal_form_bv' },
    { value: 'sole_trader', labelKey: 'auth.legal_form_sole_trader' },
    { value: 'nv', labelKey: 'auth.legal_form_nv' },
];

const VAT_REGIME_OPTIONS = [
    { value: 'small_business_exemption', labelKey: 'auth.vat_regime_small_business' },
    { value: 'vat_registered', labelKey: 'auth.vat_regime_registered' },
    { value: 'exempt_art44', labelKey: 'auth.vat_regime_exempt' },
];

const LEGAL_DOC_FIELDS = [
    { key: 'legal_document_privacy', labelKey: 'auth.legal_doc_privacy' },
    { key: 'legal_document_terms', labelKey: 'auth.legal_doc_terms' },
    { key: 'legal_document_dpa', labelKey: 'auth.legal_doc_dpa' },
    { key: 'legal_document_other', labelKey: 'profile.other' },
];

function AuthField({ label, className = '', children }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className={authLabelClass}>{label}</span>}
            {children}
        </label>
    );
}

function RegisterSteps({ step, onStep }) {
    const steps = [
        [1, t('auth.register_step_account')],
        [2, t('auth.register_step_company')],
        [3, t('auth.register_step_branding')],
        [4, t('auth.register_step_documents')],
    ];

    return (
        <div className="auth-steps mb-[22px]">
            {steps.map(([id, label]) => {
                const done = step > id;
                const active = step === id;
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => (done || active) && onStep(id)}
                        className={`auth-step${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                    >
                        <i aria-hidden="true">{done ? '✓' : id}</i>
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

export default function Register({ brandSwatches = ['#3A4AA0', '#0F766E', '#B4235A', '#C2410C', '#141A3A'] }) {
    const { toast } = useUi();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [vatLookupMessage, setVatLookupMessage] = useState('');
    const logoInputRef = useRef(null);

    const { data, setData, post, processing, errors, transform } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        first_name: '',
        surname: '',
        email_company: '',
        phone: '',
        vat_number: '',
        legal_form: 'vzw',
        vat_regime: 'small_business_exemption',
        street: '',
        house: '',
        postal_code: '',
        city: '',
        language: '',
        theme_primary: brandSwatches[0] || '#3A4AA0',
        invoice_logo: null,
        legal_document_privacy: null,
        legal_document_terms: null,
        legal_document_dpa: null,
        legal_document_other: null,
    });

    useEffect(() => {
        const keys = Object.keys(errors);
        if (keys.some((key) => ['email', 'password', 'first_name', 'surname'].includes(key))) {
            setStep(1);
        } else if (keys.some((key) => ['company_name', 'vat_number', 'legal_form', 'vat_regime'].includes(key))) {
            setStep(2);
        } else if (keys.some((key) => ['theme_primary', 'invoice_logo'].includes(key))) {
            setStep(3);
        } else if (keys.some((key) => key.startsWith('legal_document_'))) {
            setStep(4);
        }
    }, [errors]);

    const canAdvanceStep1 = useMemo(
        () =>
            data.first_name.trim() &&
            data.surname.trim() &&
            data.email.trim() &&
            data.password.trim() &&
            termsAccepted,
        [data.email, data.first_name, data.password, data.surname, termsAccepted],
    );

    const canAdvanceStep2 = useMemo(
        () => data.vat_number.trim() && data.legal_form && data.vat_regime && data.company_name.trim(),
        [data.company_name, data.legal_form, data.vat_number, data.vat_regime],
    );

    const lookupVat = () => {
        const vat = data.vat_number.trim();
        if (vat.length < 8) {
            toast.error(t('auth.register_vat_invalid'));
            return;
        }
        const company = data.company_name.trim() || t('auth.register_vat_lookup_demo_name');
        const city = data.city.trim() || t('auth.register_vat_lookup_demo_city');
        setData({
            ...data,
            company_name: company,
            city,
        });
        setVatLookupMessage(t('auth.register_vat_lookup_ok', { company, city }));
    };

    const goNext = () => {
        if (step === 1) {
            if (!canAdvanceStep1) {
                toast.error(t('auth.register_step1_incomplete'));
                return;
            }
            setStep(2);
            return;
        }
        if (step === 2) {
            if (!canAdvanceStep2) {
                toast.error(t('auth.register_step2_incomplete'));
                return;
            }
            setStep(3);
            return;
        }
        if (step === 3) {
            setStep(4);
        }
    };

    const completeRegistration = () => {
        if (step !== 4 || processing) {
            return;
        }
        transform((form) => ({
            ...form,
            name: form.name || `${form.first_name} ${form.surname}`.trim(),
            email_company: form.email_company || form.email,
            password_confirmation: form.password_confirmation || form.password,
            language: form.language || undefined,
        }));
        post('/register', { forceFormData: true });
    };

    const onFormKeyDown = (e) => {
        if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        e.preventDefault();
        if (step < 4) {
            goNext();
        } else {
            completeRegistration();
        }
    };

    const goBack = () => setStep((s) => Math.max(1, s - 1));

    const footerLeft =
        step > 1 ? (
            <button type="button" onClick={goBack} className={authRegisterBackButtonClass}>
                {t('auth.back')}
            </button>
        ) : (
            <Link href="/login" className={`text-[13px] ${authLinkClass}`}>
                {t('auth.have_account')}
            </Link>
        );

    const footerRight =
        step < 4 ? (
            <button type="button" onClick={goNext} className={authRegisterNextButtonClass}>
                {t('auth.next')}
                <span aria-hidden="true">→</span>
            </button>
        ) : (
            <button type="button" onClick={completeRegistration} disabled={processing} className={authRegisterNextButtonClass}>
                {t('auth.start_trial')}
                <span aria-hidden="true">→</span>
            </button>
        );

    return (
        <AuthSplitLayout title={t('auth.register')} formMaxWidth="lg" showFormLogo>
            <RegisterSteps step={step} onStep={setStep} />

            <div className="contents" onKeyDown={onFormKeyDown} role="group" aria-label={t('auth.register')}>
                {step === 1 && (
                    <>
                        <h2 className={authHeadingClass}>{t('auth.create_your_account')}</h2>
                        <p className={authSubClass}>{t('auth.trial_hint')}</p>

                        <div className="auth-form-grid mt-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <AuthField label={t('auth.first_name')}>
                                    <input
                                        className={authInputClass(errors.first_name)}
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                    />
                                </AuthField>
                                <AuthField label={t('auth.last_name')}>
                                    <input
                                        className={authInputClass(errors.surname)}
                                        value={data.surname}
                                        onChange={(e) => setData('surname', e.target.value)}
                                    />
                                </AuthField>
                            </div>
                            <AuthField label={t('auth.email_address')}>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    className={authInputClass(errors.email)}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </AuthField>
                            <div>
                                <span className={authLabelClass}>{t('auth.password')}</span>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        className={`${authInputClass(errors.password)} pr-16`}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-3 text-xs font-semibold text-[#48537F] hover:text-[#0E1250] dark:text-[#A1A9DD] dark:hover:text-white"
                                        onClick={() => setShowPassword((v) => !v)}
                                    >
                                        {showPassword ? t('auth.hide') : t('auth.show')}
                                    </button>
                                </div>
                                <p className="auth-hint mt-1.5">{t('auth.password_hint')}</p>
                            </div>
                            <label className="flex items-start gap-2 text-[13px] leading-snug">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 rounded border-[rgba(14,18,80,0.2)] text-[#6B59DC] focus:ring-[#9D8DF1]"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                                <span>
                                    {t('auth.terms_checkbox')}{' '}
                                    <span className="font-semibold text-[#0E1250] dark:text-white">{t('profile.terms')}</span> {t('auth.and')}{' '}
                                    <span className="font-semibold text-[#0E1250] dark:text-white">{t('auth.privacy')}</span>.
                                </span>
                            </label>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className={authHeadingClass}>{t('auth.register_company_title')}</h2>
                        <p className={authSubClass}>{t('auth.register_company_kbo_hint')}</p>

                        <div className="auth-form-grid mt-6">
                            <div>
                                <span className={authLabelClass}>{t('auth.vat_or_company_number')}</span>
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        className={`${authInputClass(errors.vat_number)} min-w-0 flex-1`}
                                        value={data.vat_number}
                                        onChange={(e) => {
                                            setData('vat_number', e.target.value);
                                            setVatLookupMessage('');
                                        }}
                                        placeholder="BE0712345678"
                                    />
                                    <button type="button" onClick={lookupVat} className={authRegisterOutlineButtonClass}>
                                        {t('auth.lookup')}
                                    </button>
                                </div>
                                {vatLookupMessage && (
                                    <p className="auth-okline mt-2 flex items-center gap-2 text-[13px] font-semibold text-[#14794A] dark:text-[#5FD3B3]">
                                        <span aria-hidden="true">✓</span>
                                        {vatLookupMessage}
                                    </p>
                                )}
                            </div>
                            <AuthField label={t('auth.legal_form')}>
                                <select
                                    className={authInputClass(errors.legal_form)}
                                    value={data.legal_form}
                                    onChange={(e) => setData('legal_form', e.target.value)}
                                >
                                    {LEGAL_FORM_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {t(opt.labelKey)}
                                        </option>
                                    ))}
                                </select>
                            </AuthField>
                            <AuthField label={t('auth.vat_regime')}>
                                <select
                                    className={authInputClass(errors.vat_regime)}
                                    value={data.vat_regime}
                                    onChange={(e) => setData('vat_regime', e.target.value)}
                                >
                                    {VAT_REGIME_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {t(opt.labelKey)}
                                        </option>
                                    ))}
                                </select>
                            </AuthField>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2 className={authHeadingClass}>{t('auth.register_branding_title')}</h2>
                        <p className={authSubClass}>{t('auth.register_branding_hint')}</p>

                        <div className="auth-form-grid mt-6">
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => logoInputRef.current?.click()}
                                onKeyDown={(e) => e.key === 'Enter' && logoInputRef.current?.click()}
                                className="auth-drop cursor-pointer text-center"
                            >
                                <Icon name="up" className="mx-auto mb-2 h-6 w-6 text-[#6B59DC]" />
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                    className="sr-only"
                                    onChange={(e) => setData('invoice_logo', e.target.files?.[0] ?? null)}
                                />
                                <p className="font-semibold text-[#0E1250] dark:text-[#E8ECFF]">{t('auth.logo_drop_title')}</p>
                                <p className="auth-hint mt-1">{t('auth.logo_drop_hint')}</p>
                                {data.invoice_logo && (
                                    <p className="mt-2 text-[13px] font-semibold text-[#14794A] dark:text-[#5FD3B3]">{data.invoice_logo.name}</p>
                                )}
                            </div>
                            <div>
                                <span className={authLabelClass}>{t('auth.primary_colour')}</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {brandSwatches.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            aria-label={color}
                                            className={`auth-swatch h-9 w-9 rounded-full border-2 transition ${
                                                data.theme_primary === color
                                                    ? 'border-[#0E1250] dark:border-white'
                                                    : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setData('theme_primary', color)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {step === 4 && (
                    <>
                        <h2 className={authHeadingClass}>{t('auth.register_documents_title')}</h2>
                        <p className={authSubClass}>{t('auth.register_documents_hint')}</p>

                        <div className="auth-doc-list">
                            {LEGAL_DOC_FIELDS.map(({ key, labelKey }) => (
                                <div key={key} className="auth-doc-row">
                                    <div className="auth-doc-icon">
                                        <Icon name="file" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="auth-doc-title">{t(labelKey)}</div>
                                        {data[key]?.name && <div className="auth-doc-filename">{data[key].name}</div>}
                                    </div>
                                    <label className="auth-doc-upload-btn">
                                        <Icon name="up" className="h-4 w-4" />
                                        {t('auth.upload')}
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="sr-only"
                                            onChange={(e) => setData(key, e.target.files?.[0] ?? null)}
                                        />
                                    </label>
                                </div>
                            ))}
                            <div className="auth-doc-note">
                                <Icon name="spark" className="auth-doc-note__spark h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                                <div>
                                    {t('auth.register_documents_contact_lead')}{' '}
                                    <button
                                        type="button"
                                        className="auth-doc-note__link"
                                        onClick={() => toast.info(t('auth.register_contact_toast'))}
                                    >
                                        {t('auth.contact_us')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="auth-register-row mt-[22px] flex w-full items-center justify-between gap-3">
                    <div className="min-w-0">{footerLeft}</div>
                    <div className="shrink-0">{footerRight}</div>
                </div>
            </div>
        </AuthSplitLayout>
    );
}
