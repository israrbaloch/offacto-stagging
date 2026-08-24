import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import I18nSync from '../Components/I18nSync';
import Sidebar from '../Components/Sidebar';
import Toast from '../Components/Toast';
import TopBar from '../Components/TopBar';
import { t } from '../lib/i18n';

export default function AuthenticatedLayout({ title, children }) {
    const { activeCompany, auth, flash, appearance } = usePage().props;
    const primary = activeCompany?.theme?.primary || '#4054b2';
    const secondary = activeCompany?.theme?.secondary || '#0f172a';

    useEffect(() => {
        document.documentElement.style.setProperty('--company-primary', primary);
        document.documentElement.style.setProperty('--company-secondary', secondary);
        document.documentElement.classList.toggle('dark', appearance === 'dark');
    }, [primary, secondary, appearance]);

    return (
        <div className="h-screen overflow-hidden bg-slate-100">
            <I18nSync />
            <Head title={title} />
            <Toast />
            <div className="flex h-full">
                <Sidebar />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white lg:rounded-r-3xl">
                    <TopBar />
                    {activeCompany?.trial_expired && !auth?.user?.is_admin && (
                        <div className="border-b border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 lg:px-8">
                            {t('layout.trial_expired')}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="border-b border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 lg:px-8">
                            {flash.error}
                        </div>
                    )}
                    {activeCompany?.pending_approval && (
                        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 lg:px-8">
                            {t('layout.pending_approval')}
                        </div>
                    )}
                    <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-6 lg:px-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
