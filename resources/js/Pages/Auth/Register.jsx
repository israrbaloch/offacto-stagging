import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import I18nSync from '../../Components/I18nSync';
import LocaleSelect from '../../Components/LocaleSelect';
import Logo from '../../Components/Logo';
import FloatingFavicons from '../../Components/FloatingFavicons';
import SelectMenu from '../../Components/SelectMenu';
import Toast from '../../Components/Toast';
import { t } from '../../lib/i18n';
import { optionsFromMap } from '../../lib/utils';

const testimonials = [
    {
        quote: 'Offacto transformed our chaotic billing process into a smooth, automated workflow. Highly recommended.',
        author: 'Sarah Jenkins, CEO',
    },
    {
        quote: 'We send offers and invoices in minutes now. The team finally has a single place for every client.',
        author: 'Marcus Hale, Founder',
    },
    {
        quote: 'Approvals, payments, and follow-up used to live in three tools. Offacto brought it all together.',
        author: 'Lena Ortiz, Operations',
    },
];

function Field({ label, error, className = '', children }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>}
            {children}
            {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
        </label>
    );
}

const inputClass = (error) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
        error ? 'border-rose-400' : 'border-slate-200'
    }`;

export default function Register({ languages = {} }) {
    const [showPassword, setShowPassword] = useState(false);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const testimonial = testimonials[testimonialIndex];

    useEffect(() => {
        const timer = setInterval(() => {
            setTestimonialIndex((current) => (current + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);
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
        street: '',
        house: '',
        postal_code: '',
        city: '',
        language: '',
        self_employed_activity: '',
    });

    const submit = (e) => {
        e.preventDefault();
        transform((form) => ({
            ...form,
            name: form.name || `${form.first_name} ${form.surname}`.trim(),
            email_company: form.email_company || form.email,
            password_confirmation: form.password_confirmation || form.password,
        }));
        post('/register');
    };

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-8">
            <I18nSync />
            <Head title={t('auth.register')} />
            <Toast />
            <div className="mx-auto mb-3 flex max-w-6xl justify-end">
                <LocaleSelect />
            </div>
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <aside className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-indigo-50 px-10 py-10 lg:flex">
                    <FloatingFavicons count={8} minSize={36} maxSize={128} />
                    <div className="relative">
                        <Logo className="h-8 w-auto" />
                        <h1 className="mt-14 text-4xl font-semibold leading-tight tracking-tight text-slate-900">
                            {t('auth.headline')}
                        </h1>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                            {t('auth.tagline')}
                        </p>
                        <ul className="mt-8 space-y-3 text-sm text-slate-700">
                            {['auth.feature_1', 'auth.feature_2', 'auth.feature_3'].map(
                                (item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                            ✓
                                        </span>
                                        {t(item)}
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                    <blockquote className="relative z-10 mt-10 min-h-[148px] rounded-2xl bg-white p-5 shadow-sm">
                        <div key={testimonial.author} className="register-quote">
                            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                                “
                            </div>
                            <p className="text-sm leading-6 text-slate-600">{testimonial.quote}</p>
                            <footer className="mt-3 text-xs font-medium text-slate-400">{testimonial.author}</footer>
                        </div>
                    </blockquote>
                </aside>

                <section className="flex w-full flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
                    <div className="mx-auto w-full max-w-lg">
                        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{t('auth.create_your_account')}</h2>
                        <p className="mt-2 text-sm text-slate-500">{t('auth.trial_hint')}</p>

                        <form onSubmit={submit} className="mt-8 space-y-8">
                            <fieldset>
                                <legend className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                    {t('auth.account_info')}
                                </legend>
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label={t('auth.first_name')} error={errors.first_name}>
                                            <input
                                                className={inputClass(errors.first_name)}
                                                placeholder="Jane"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                            />
                                        </Field>
                                        <Field label={t('auth.last_name')} error={errors.surname}>
                                            <input
                                                className={inputClass(errors.surname)}
                                                placeholder="Doe"
                                                value={data.surname}
                                                onChange={(e) => setData('surname', e.target.value)}
                                            />
                                        </Field>
                                    </div>
                                    <Field label={t('auth.email_address')} error={errors.email}>
                                        <input
                                            type="email"
                                            className={inputClass(errors.email)}
                                            placeholder="jane@company.com"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </Field>
                                    <div>
                                        <span className="mb-1.5 block text-sm font-medium text-slate-600">{t('auth.password')}</span>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className={`${inputClass(errors.password)} pr-14`}
                                                placeholder={t('auth.create_password')}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-3 text-xs font-medium text-slate-400 hover:text-slate-600"
                                                onClick={() => setShowPassword((v) => !v)}
                                            >
                                                {showPassword ? t('auth.hide') : t('auth.show')}
                                            </button>
                                        </div>
                                        {errors.password && <span className="mt-1 block text-xs text-rose-600">{errors.password}</span>}
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                    {t('auth.company_setup')}
                                </legend>
                                <div className="space-y-4">
                                    <Field label={t('auth.company_name')} error={errors.company_name}>
                                        <input
                                            className={inputClass(errors.company_name)}
                                            placeholder="Acme Corp"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                        />
                                    </Field>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label={t('auth.vat_optional')} error={errors.vat_number}>
                                            <input
                                                className={inputClass(errors.vat_number)}
                                                placeholder="BE0123456789"
                                                value={data.vat_number}
                                                onChange={(e) => setData('vat_number', e.target.value)}
                                            />
                                        </Field>
                                        <Field label={t('auth.activity_type')} error={errors.self_employed_activity}>
                                            <SelectMenu
                                                className={inputClass(errors.self_employed_activity)}
                                                value={data.self_employed_activity}
                                                onChange={(e) => setData('self_employed_activity', e.target.value)}
                                                placeholder={t('auth.select_activity')}
                                                options={[
                                                    { value: 'main_profession', label: t('companies.main_profession') },
                                                    { value: 'secondary_profession', label: t('companies.secondary_profession') },
                                                ]}
                                            />
                                        </Field>
                                    </div>
                                    <Field label={t('auth.company_email')} error={errors.email_company}>
                                        <input
                                            type="email"
                                            className={inputClass(errors.email_company)}
                                            placeholder="billing@company.com"
                                            value={data.email_company}
                                            onChange={(e) => setData('email_company', e.target.value)}
                                        />
                                    </Field>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label={t('common.phone')} error={errors.phone}>
                                            <input
                                                className={inputClass(errors.phone)}
                                                placeholder="+32 470 00 00 00"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                            />
                                        </Field>
                                        <Field label={t('auth.language')} error={errors.language}>
                                            <SelectMenu
                                                className={inputClass(errors.language)}
                                                value={data.language}
                                                onChange={(e) => setData('language', e.target.value)}
                                                placeholder={t('auth.select_language')}
                                                options={optionsFromMap(languages)}
                                            />
                                        </Field>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <Field label={t('auth.street')} className="sm:col-span-2" error={errors.street}>
                                            <input
                                                className={inputClass(errors.street)}
                                                placeholder="Main Street"
                                                value={data.street}
                                                onChange={(e) => setData('street', e.target.value)}
                                            />
                                        </Field>
                                        <Field label={t('auth.house_no')} error={errors.house}>
                                            <input
                                                className={inputClass(errors.house)}
                                                placeholder="12"
                                                value={data.house}
                                                onChange={(e) => setData('house', e.target.value)}
                                            />
                                        </Field>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label={t('auth.postal')} error={errors.postal_code}>
                                            <input
                                                className={inputClass(errors.postal_code)}
                                                placeholder="1000"
                                                value={data.postal_code}
                                                onChange={(e) => setData('postal_code', e.target.value)}
                                            />
                                        </Field>
                                        <Field label={t('auth.city')} error={errors.city}>
                                            <input
                                                className={inputClass(errors.city)}
                                                placeholder="Brussels"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </fieldset>

                            {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                            >
                                {t('auth.start_trial')}
                                <span aria-hidden="true">→</span>
                            </button>
                        </form>

                        <p className="mt-4 text-center text-xs text-slate-400">
                            {t('auth.terms_agree')}{' '}
                            <span className="font-medium text-slate-600">{t('profile.terms')}</span> {t('auth.and')}{' '}
                            <span className="font-medium text-slate-600">{t('auth.privacy')}</span>.
                        </p>
                        <p className="mt-6 text-center text-sm text-slate-500">
                            {t('auth.have_account')}{' '}
                            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                {t('auth.sign_in')}
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
