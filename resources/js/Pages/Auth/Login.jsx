import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import I18nSync from '../../Components/I18nSync';
import LocaleSelect from '../../Components/LocaleSelect';
import Logo from '../../Components/Logo';
import FloatingFavicons from '../../Components/FloatingFavicons';
import Toast from '../../Components/Toast';
import { t } from '../../lib/i18n';

const inputClass = (error) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
        error ? 'border-rose-400' : 'border-slate-200'
    }`;

export default function Login({ allowRegistration = true }) {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-8">
            <I18nSync />
            <Head title={t('auth.login')} />
            <Toast />
            <div className="mx-auto mb-3 flex max-w-6xl justify-end">
                <LocaleSelect />
            </div>
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <aside className="relative hidden w-[42%] flex-col justify-center overflow-hidden bg-indigo-50 px-10 py-10 lg:flex">
                    <FloatingFavicons count={8} minSize={36} maxSize={128} />
                    <div className="relative z-10">
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
                </aside>

                <section className="flex w-full flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
                    <div className="mx-auto w-full max-w-md">
                        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{t('auth.welcome')}</h2>
                        <p className="mt-2 text-sm text-slate-500">{t('auth.sign_in_hint')}</p>

                        {flash?.status && <p className="mt-4 text-sm text-emerald-600">{flash.status}</p>}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                post('/login');
                            }}
                            className="mt-8 space-y-5"
                        >
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-slate-600">{t('auth.email_address')}</span>
                                <input
                                    type="email"
                                    className={inputClass(errors.email)}
                                    placeholder="jane@company.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}
                            </label>

                            <div>
                                <span className="mb-1.5 block text-sm font-medium text-slate-600">{t('auth.password')}</span>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`${inputClass(errors.password)} pr-14`}
                                        placeholder={t('auth.password_placeholder')}
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

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    {t('auth.remember')}
                                </label>
                                <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    {t('auth.forgot')}
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                            >
                                {t('auth.sign_in')}
                                <span aria-hidden="true">→</span>
                            </button>
                        </form>

                        {allowRegistration && (
                            <p className="mt-6 text-center text-sm text-slate-500">
                                {t('auth.no_account')}{' '}
                                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    {t('auth.create_account')}
                                </Link>
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
