import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import FlashToaster from '../Components/FlashToaster';
import FormErrorsToaster from '../Components/FormErrorsToaster';
import I18nSync from '../Components/I18nSync';
import Sidebar from '../Components/Sidebar';
import SubscriptionReminderModal from '../Components/SubscriptionReminderModal';
import TopBar from '../Components/TopBar';
import { t } from '../lib/i18n';

export default function AuthenticatedLayout({ title, children, shellClass = '' }) {
    const { activeCompany, adminWorkspace, auth, flash, appearance, url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);
    const primary = activeCompany?.theme?.primary || '#4054b2';
    const secondary = activeCompany?.theme?.secondary || '#0f172a';

    useEffect(() => {
        document.documentElement.style.setProperty('--company-primary', primary);
        document.documentElement.style.setProperty('--company-secondary', secondary);
        document.documentElement.classList.toggle('dark', appearance === 'dark');
    }, [primary, secondary, appearance]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [url]);

    useEffect(() => {
        if (!sidebarOpen) {
            document.body.style.removeProperty('overflow');
            return undefined;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [sidebarOpen]);

    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'Escape') {
                setSidebarOpen(false);
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    return (
        <div className="offacto-app-shell font-[Figtree,system-ui,sans-serif]">
            <I18nSync />
            <Head title={title} />
            <FlashToaster />
            <FormErrorsToaster />
            <SubscriptionReminderModal />
            <div className="offacto-app-shell__frame">
                <button
                    type="button"
                    className={`offacto-sidebar-scrim${sidebarOpen ? ' on' : ''}`}
                    aria-label={t('common.close')}
                    onClick={closeSidebar}
                />
                <Sidebar mobileOpen={sidebarOpen} onNavigate={closeSidebar} />
                <div
                    className={`offacto-app-scroll flex min-h-0 min-w-0 flex-1 flex-col text-[14.5px] leading-normal ${shellClass}`.trim()}
                >
                    <TopBar onMenuClick={toggleSidebar} />
                    {adminWorkspace && (
                        <div className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm text-indigo-900 lg:mx-7">
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
                        <div className="mx-4 mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 lg:mx-7">
                            {t('layout.trial_expired')}{' '}
                            <Link href="/upgrade" className="font-semibold underline underline-offset-2 hover:text-rose-900">
                                {t('layout.upgrade_now')}
                            </Link>
                        </div>
                    )}
                    {activeCompany?.pending_approval && (
                        <div className="mx-4 mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 lg:mx-7">
                            {t('layout.pending_approval')}
                        </div>
                    )}
                    <main className="offacto-page mx-auto w-full max-w-[1320px]">{children}</main>
                </div>
            </div>
        </div>
    );
}
