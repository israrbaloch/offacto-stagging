import { Link, usePage } from '@inertiajs/react';
import { t } from '../lib/i18n';
import CompanySwitcher from './CompanySwitcher';
import FloatingFavicons from './FloatingFavicons';
import Icon from './Icon';
import Logo from './Logo';

const workspaceNav = [
    { href: '/dashboard', label: 'nav.dashboard', icon: 'grid', exact: true },
    { href: '/customers', label: 'nav.customers', icon: 'customers' },
    { href: '/services', label: 'nav.services', icon: 'wrench' },
    { href: '/briefings', label: 'nav.briefings', icon: 'clipboard' },
    { href: '/offers', label: 'nav.offers', icon: 'document' },
    { href: '/invoices', label: 'nav.invoices', icon: 'invoice' },
];

const platformNav = [
    { href: '/admin/users', label: 'nav.platform_users', icon: 'user' },
    { href: '/admin/companies', label: 'nav.all_companies', icon: 'building' },
    { href: '/admin/services', label: 'nav.service_approvals', icon: 'wrench', badgeKey: 'pendingServices' },
    { href: '/settings', label: 'nav.platform_settings', icon: 'settings' },
];

const footerNav = [{ href: '/support', label: 'nav.support', icon: 'help' }];

function isActive(url, item) {
    if (item.exact) {
        return url === item.href;
    }
    const matches = [item.href, ...(item.aliases || [])];
    return matches.some((href) => url === href || url.startsWith(`${href}/`));
}

function NavLink({ item, url, badge }) {
    const active = isActive(url, item);

    return (
        <Link
            href={item.href}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                    ? 'bg-indigo-100 font-medium text-indigo-700'
                    : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
            }`}
        >
            {active && (
                <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[var(--company-primary)]" />
            )}
            <Icon name={item.icon} />
            <span className="flex-1">{t(item.label)}</span>
            {badge > 0 && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-slate-900">{badge}</span>
            )}
        </Link>
    );
}

export default function Sidebar() {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const appearance = props.appearance;
    const activeCompany = props.activeCompany;
    const adminQueue = props.adminQueue;
    void props.locale;

    const isAdmin = Boolean(user?.is_admin);
    const viewingCompany = Boolean(activeCompany);

    return (
        <aside className="auth-aside-bg relative hidden h-full w-[250px] shrink-0 flex-col overflow-hidden rounded-l-3xl lg:flex">
            <FloatingFavicons count={6} minSize={24} maxSize={80} />
            <div className="relative z-10 px-5 pt-6">
                <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1">
                    {activeCompany?.invoice_logo_url ? (
                        <img
                            src={activeCompany.invoice_logo_url}
                            alt={activeCompany.company_name || 'Company'}
                            className="h-10 max-w-[170px] object-contain"
                        />
                    ) : (
                        <Logo variant={appearance === 'dark' ? 'white' : 'dark'} className="h-8 w-auto" />
                    )}
                </Link>
                <div className="mt-5">
                    <CompanySwitcher />
                </div>
                {viewingCompany && (
                    <Link
                        href="/invoices/create"
                        className="mt-4 flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('nav.create_invoice')}
                    </Link>
                )}
            </div>

            <nav className="relative z-10 mt-6 flex-1 space-y-1 overflow-y-auto px-3 pb-6">
                {isAdmin && (
                    <>
                        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            {t('nav.platform_control')}
                        </p>
                        {platformNav.map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                url={url}
                                badge={item.badgeKey === 'pendingServices' ? adminQueue?.pendingServices || 0 : 0}
                            />
                        ))}
                        <div className="my-3 border-t border-indigo-100" />
                    </>
                )}

                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {viewingCompany ? t('nav.company_workspace') : t('nav.workspace_select_company')}
                </p>
                {workspaceNav.map((item) => (
                    <NavLink key={item.href} item={item} url={url} />
                ))}

                {!isAdmin && (
                    <NavLink item={{ href: '/companies', label: 'nav.companies', icon: 'building' }} url={url} />
                )}

                <div className="my-3 border-t border-indigo-100" />
                {footerNav.map((item) => (
                    <NavLink key={item.href} item={item} url={url} />
                ))}
            </nav>
        </aside>
    );
}
