import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import I18nSync from '../Components/I18nSync';
import FloatingFavicons from '../Components/FloatingFavicons';
import Logo from '../Components/Logo';
import Toast from '../Components/Toast';
import { t } from '../lib/i18n';

export default function AuthSplitLayout({ title, asideFooter, children }) {
    const { appearance } = usePage().props;

    useEffect(() => {
        document.documentElement.classList.toggle('dark', appearance === 'dark');
    }, [appearance]);

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-8">
            <I18nSync />
            <Head title={title} />
            <Toast />
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
                    {asideFooter}
                </aside>
                <section className="flex w-full flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
                    <div className="mx-auto w-full max-w-md">{children}</div>
                </section>
            </div>
        </div>
    );
}

export const inputClass = (error) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
        error ? 'border-rose-400' : 'border-slate-200'
    }`;
