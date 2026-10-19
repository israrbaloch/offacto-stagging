import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import FlashToaster from '../Components/FlashToaster';
import I18nSync from '../Components/I18nSync';
import Sidebar from '../Components/Sidebar';
import SubscriptionReminderModal from '../Components/SubscriptionReminderModal';
import TopBar from '../Components/TopBar';
import { t } from '../lib/i18n';

export default function AuthenticatedLayout({ title, children }) {
    const { activeCompany, adminWorkspace, auth, flash, appearance } = usePage().props;
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
            <FlashToaster />
            <SubscriptionReminderModal />
            <div className="flex h-full">
                <Sidebar />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white lg:rounded-r-3xl">
                    <TopBar />
                    {adminWorkspace && (
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm text-indigo-900 lg:px-8">
                            <span>
                                Admin workspace: <strong>{adminWorkspace.company_name || `Company #${adminWorkspace.company_id}`}</strong>
                                {' — '}
                                troubleshooting view (audited).
                            </span>
                            <button
                                type="button"
                                onClick={() => router.post(adminWorkspace.exit_url)}
                                className="rounded-full bg-indigo-700 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-800"
                            >
                                Exit workspace
                            </button>
                        </div>
                    )}
                    {activeCompany?.trial_expired && !auth?.user?.is_admin && (
                        <div className="border-b border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 lg:px-8">
                            {t('layout.trial_expired')}{' '}
                            <Link href="/upgrade" className="font-semibold underline underline-offset-2 hover:text-rose-900">
                                {t('layout.upgrade_now')}
                            </Link>
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
