import { Head, Link, usePage } from '@inertiajs/react';
import FlashToaster from '../Components/FlashToaster';
import I18nSync from '../Components/I18nSync';
import Logo from '../Components/Logo';
import { t } from '../lib/i18n';

export default function AdminLayout() {
    const { auth } = usePage().props;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100">
            <I18nSync />
            <Head title="Admin" />
            <FlashToaster />
            <aside className="flex w-[240px] shrink-0 flex-col bg-slate-950 text-white">
                <div className="px-5 py-6">
                    <Logo variant="white" className="h-7 w-auto" />
                </div>
                <nav className="flex-1" />
                <div className="border-t border-white/10 px-5 py-4">
                    <div className="truncate text-sm font-medium">{auth?.user?.name}</div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="mt-2 text-xs text-white/60 hover:text-white"
                    >
                        {t('topbar.logout')}
                    </Link>
                </div>
            </aside>
            <main className="min-w-0 flex-1 bg-white" />
        </div>
    );
}
