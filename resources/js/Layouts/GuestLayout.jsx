import { Head } from '@inertiajs/react';
import I18nSync from '../Components/I18nSync';
import Logo from '../Components/Logo';
import Toast from '../Components/Toast';
import { t } from '../lib/i18n';

export default function GuestLayout({ title, children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
            <I18nSync />
            <Head title={title} />
            <Toast />
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Logo variant="white" className="mx-auto h-9 w-auto" />
                    <p className="mt-1 text-sm text-slate-400">{t('guest.tagline')}</p>
                </div>
                <div className="rounded-2xl bg-white p-8 shadow-xl">{children}</div>
            </div>
        </div>
    );
}
