import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminTopBar from '../Components/Admin/shared/AdminTopBar';
import FlashToaster from '../Components/FlashToaster';
import FloatingFavicons from '../Components/FloatingFavicons';
import I18nSync from '../Components/I18nSync';
import Logo from '../Components/Logo';
import SidebarNavLink, { resolveSidebarActiveHref } from '../Components/SidebarNavLink';

const navGroups = [
    {
        label: 'Overview',
        items: [{ href: '/admin', label: 'Dashboard', icon: 'grid', exact: true }],
    },
    {
        label: 'Directory',
        items: [
            { href: '/admin/companies', label: 'Companies', icon: 'building' },
            { href: '/admin/companies/approvals', label: 'Approvals', icon: 'clipboard' },
            { href: '/admin/users', label: 'Users', icon: 'customers' },
        ],
    },
    {
        label: 'Platform',
        items: [
            { href: '/admin/settings', label: 'Settings', icon: 'settings' },
            { href: '/admin/financial', label: 'Financial docs', icon: 'invoice' },
            { href: '/admin/compliance', label: 'Compliance', icon: 'clipboard' },
            { href: '/admin/integrations', label: 'Integrations', icon: 'settings' },
            { href: '/admin/communications', label: 'Email & comms', icon: 'help' },
            { href: '/admin/product', label: 'Product & content', icon: 'document' },
            { href: '/admin/governance', label: 'Governance', icon: 'clipboard' },
        ],
    },
    {
        label: 'Billing',
        items: [
            { href: '/admin/subscriptions', label: 'Subscriptions', icon: 'invoice' },
            { href: '/admin/subscriptions/directory', label: 'Directory', icon: 'document' },
            { href: '/admin/plans', label: 'Plans', icon: 'grid' },
            { href: '/admin/billing/settings', label: 'Billing rules', icon: 'settings' },
            { href: '/admin/billing/coupons', label: 'Coupons', icon: 'help' },
            { href: '/admin/billing/payments', label: 'Payments', icon: 'clipboard' },
            { href: '/admin/billing/reports', label: 'Reports', icon: 'building' },
        ],
    },
    {
        label: 'Support',
        items: [
            { href: '/admin/support', label: 'Support hub', icon: 'help' },
            { href: '/admin/support/tickets', label: 'Tickets', icon: 'clipboard' },
        ],
    },
    {
        label: 'Security',
        items: [
            { href: '/admin/security', label: 'Security hub', icon: 'settings' },
            { href: '/admin/security/operations/fraud-queue', label: 'Fraud queue', icon: 'clipboard' },
        ],
    },
    {
        label: 'Infrastructure',
        items: [
            { href: '/admin/infrastructure', label: 'Infrastructure hub', icon: 'grid' },
            { href: '/admin/infrastructure/operations/database-health', label: 'Database health', icon: 'settings' },
            { href: '/admin/infrastructure/operations/failed-jobs', label: 'Failed jobs', icon: 'clipboard' },
        ],
    },
    {
        label: 'Audit',
        items: [
            { href: '/admin/logs/security', label: 'Security log (legacy)', icon: 'settings' },
            { href: '/admin/logs/activity', label: 'Activity', icon: 'help' },
        ],
    },
];

const allNavItems = navGroups.flatMap((group) => group.items);

export default function AdminLayout({ title = 'Admin', children }) {
    const { url, props } = usePage();
    const appearance = props.appearance;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const activeHref = resolveSidebarActiveHref(url, allNavItems);
    const sidebarNavRef = useRef(null);

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

    useEffect(() => {
        document.documentElement.style.setProperty('--company-primary', '#0f172a');
        document.documentElement.style.setProperty('--company-secondary', '#64748b');
        document.documentElement.classList.toggle('dark', appearance === 'dark');
    }, [appearance]);

    return (
        <div className="h-screen overflow-hidden bg-slate-100">
            <I18nSync />
            <Head title={title ? `${title} · Admin` : 'Admin'} />
            <FlashToaster />
            <div className="flex h-full">
                <aside
                    className={`auth-aside-bg fixed inset-y-0 left-0 z-40 flex h-full w-[240px] shrink-0 flex-col overflow-hidden border-r border-white/40 transition-transform lg:static lg:translate-x-0 ${
                        mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <FloatingFavicons count={5} minSize={20} maxSize={64} />
                    <div className="relative z-10 px-4 pt-5">
                        <Link href="/admin" className="flex items-center justify-center">
                            <Logo variant={appearance === 'dark' ? 'white' : 'dark'} className="h-7 w-auto" />
                        </Link>
                        <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Platform</p>
                    </div>
                    <nav ref={sidebarNavRef} className="admin-sidebar-nav relative z-10 mt-2 min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-6">
                        {navGroups.map((group) => (
                            <div key={group.label}>
                                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/90">{group.label}</p>
                                <div className="space-y-0.5">
                                    {group.items.map((item) => (
                                        <SidebarNavLink
                                            key={item.href}
                                            item={item}
                                            activeHref={activeHref}
                                            label={item.label}
                                            onNavigate={() => setMobileNavOpen(false)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white lg:rounded-l-none">
                    <AdminTopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
                    {mobileNavOpen && (
                        <button type="button" className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
                    )}
                    <div className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
                </div>
            </div>
        </div>
    );
}
