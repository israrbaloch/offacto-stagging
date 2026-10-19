import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { t } from '../lib/i18n';
import CompanySwitcher from './CompanySwitcher';
import FloatingFavicons from './FloatingFavicons';
import Icon from './Icon';
import Logo from './Logo';
import SidebarNavLink, { resolveSidebarActiveHref } from './SidebarNavLink';

const workspaceNav = [
    { href: '/dashboard', label: 'nav.dashboard', icon: 'grid', exact: true },
    { href: '/customers', label: 'nav.customers', icon: 'customers' },
    { href: '/services', label: 'nav.services', icon: 'wrench' },
    { href: '/briefings', label: 'nav.briefings', icon: 'clipboard' },
    { href: '/offers', label: 'nav.offers', icon: 'document' },
    { href: '/invoices', label: 'nav.invoices', icon: 'invoice' },
];

const companyNav = [{ href: '/companies', label: 'nav.companies', icon: 'building' }];

const footerNav = [{ href: '/support', label: 'nav.support', icon: 'help' }];

const allNavItems = [...workspaceNav, ...companyNav, ...footerNav];

export default function Sidebar() {
    const { url, props } = usePage();
    const appearance = props.appearance;
    const activeCompany = props.activeCompany;
    const sidebarNavRef = useRef(null);
    const activeHref = resolveSidebarActiveHref(url, allNavItems);

    const viewingCompany = Boolean(activeCompany);

    useEffect(() => {
        const container = sidebarNavRef.current;
        const link = container?.querySelector('[data-nav-active="true"]');
        if (!container || !link) {
            return;
        }

        const frame = requestAnimationFrame(() => {
            const linkRect = link.getBoundingClientRect();
            const navRect = container.getBoundingClientRect();
            const padding = 8;
            const fullyVisible = linkRect.top >= navRect.top + padding && linkRect.bottom <= navRect.bottom - padding;

            if (!fullyVisible) {
                link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });

        return () => cancelAnimationFrame(frame);
    }, [activeHref, url]);

    return (
        <aside className="auth-aside-bg relative hidden h-full w-[240px] shrink-0 flex-col overflow-hidden border-r border-white/40 lg:flex">
            <FloatingFavicons count={6} minSize={24} maxSize={80} />
            <div className="relative z-10 px-4 pt-5">
                <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1">
                    {activeCompany?.invoice_logo_url ? (
                        <img
                            src={activeCompany.invoice_logo_url}
                            alt={activeCompany.company_name || 'Company'}
                            className="h-10 max-w-[170px] object-contain"
                        />
                    ) : (
                        <Logo variant={appearance === 'dark' ? 'white' : 'dark'} className="h-7 w-auto" />
                    )}
                </Link>
                <div className="mt-4">
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

            <nav ref={sidebarNavRef} className="admin-sidebar-nav relative z-10 mt-2 min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-6">
                <div>
                    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/90">
                        {viewingCompany ? t('nav.company_workspace') : t('nav.workspace_select_company')}
                    </p>
                    <div className="space-y-0.5">
                        {workspaceNav.map((item) => (
                            <SidebarNavLink key={item.href} item={item} activeHref={activeHref} label={t(item.label)} />
                        ))}
                        {companyNav.map((item) => (
                            <SidebarNavLink key={item.href} item={item} activeHref={activeHref} label={t(item.label)} />
                        ))}
                    </div>
                </div>
                <div>
                    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/90">{t('nav.support')}</p>
                    <div className="space-y-0.5">
                        {footerNav.map((item) => (
                            <SidebarNavLink key={item.href} item={item} activeHref={activeHref} label={t(item.label)} />
                        ))}
                    </div>
                </div>
            </nav>
        </aside>
    );
}
