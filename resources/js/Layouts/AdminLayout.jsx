import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminTopBar from '../Components/Admin/shared/AdminTopBar';
import FlashToaster from '../Components/FlashToaster';
import FormErrorsToaster from '../Components/FormErrorsToaster';
import I18nSync from '../Components/I18nSync';
import Icon from '../Components/Icon';
import Logo from '../Components/Logo';
import SidebarNavLink, { resolveSidebarActiveHref } from '../Components/SidebarNavLink';
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed';
import { t } from '../lib/i18n';

const navGroups = [
    {
        label: 'Overview',
        items: [{ href: '/admin', label: 'Dashboard', icon: 'grid', exact: true }],
    },
    {
        label: 'Directory',
        items: [
            { href: '/admin/companies', label: 'Companies', icon: 'building', permission: ['admin.support', 'admin.compliance'] },
            { href: '/admin/companies/approvals', label: 'Approvals', icon: 'clipboard', permission: ['admin.support', 'admin.compliance'] },
            { href: '/admin/users', label: 'Users', icon: 'customers', permission: 'admin.security' },
        ],
    },
    {
        label: 'Platform',
        items: [
            { href: '/admin/settings', label: 'Settings', icon: 'settings', permission: 'admin.settings' },
            { href: '/admin/financial', label: 'Financial docs', icon: 'invoice', permission: 'admin.billing' },
            { href: '/admin/compliance', label: 'Compliance', icon: 'clipboard', permission: 'admin.compliance' },
            { href: '/admin/integrations', label: 'Integrations', icon: 'settings', permission: 'admin.settings' },
            { href: '/admin/communications', label: 'Email & comms', icon: 'help', permission: 'admin.settings' },
            { href: '/admin/product', label: 'Product & content', icon: 'document', permission: 'admin.settings' },
            { href: '/admin/governance', label: 'Governance', icon: 'clipboard', permission: 'admin.governance' },
        ],
    },
    {
        label: 'Billing',
        items: [
            { href: '/admin/subscriptions', label: 'Subscriptions', icon: 'invoice', permission: 'admin.billing' },
            { href: '/admin/subscriptions/directory', label: 'Directory', icon: 'document', permission: 'admin.billing' },
            { href: '/admin/plans', label: 'Plans', icon: 'grid', permission: 'admin.billing' },
            { href: '/admin/billing/settings', label: 'Billing rules', icon: 'settings', permission: 'admin.billing' },
            { href: '/admin/billing/coupons', label: 'Coupons', icon: 'help', permission: 'admin.billing' },
            { href: '/admin/billing/payments', label: 'Payments', icon: 'clipboard', permission: 'admin.billing' },
            { href: '/admin/billing/reports', label: 'Reports', icon: 'building', permission: 'admin.billing' },
        ],
    },
    {
        label: 'Support',
        items: [
            { href: '/admin/support', label: 'Support hub', icon: 'help', permission: 'admin.support' },
            { href: '/admin/support/tickets', label: 'Tickets', icon: 'clipboard', permission: 'admin.support' },
        ],
    },
    {
        label: 'Security',
        items: [
            { href: '/admin/security', label: 'Security hub', icon: 'settings', permission: 'admin.security' },
            { href: '/admin/security/operations/fraud-queue', label: 'Fraud queue', icon: 'clipboard', permission: 'admin.security' },
        ],
    },
    {
        label: 'Infrastructure',
        items: [
            { href: '/admin/infrastructure', label: 'Infrastructure hub', icon: 'grid', permission: 'admin.governance' },
            { href: '/admin/infrastructure/operations/database-health', label: 'Database health', icon: 'settings', permission: 'admin.governance' },
            { href: '/admin/infrastructure/operations/failed-jobs', label: 'Failed jobs', icon: 'clipboard', permission: 'admin.governance' },
        ],
    },
    {
        label: 'Audit',
        items: [
            { href: '/admin/logs/security', label: 'Security log (legacy)', icon: 'settings', permission: 'admin.security' },
            { href: '/admin/logs/activity', label: 'Activity', icon: 'help', permission: 'admin.security' },
        ],
    },
];

const allNavItems = navGroups.flatMap((group) => group.items);

export default function AdminLayout({ title = 'Admin', children }) {
    const { url, props } = usePage();
    const appearance = props.appearance;
    const granted = props.auth?.user?.permissions || [];
    const isPlatformAdmin = props.auth?.user?.is_admin;
    const visibleGroups = navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => {
                if (!item.permission) {
                    return true;
                }
                if (isPlatformAdmin && granted.length === 0) {
                    return true;
                }
                const needed = Array.isArray(item.permission) ? item.permission : [item.permission];
                return needed.some((name) => granted.includes(name));
            }),
        }))
        .filter((group) => group.items.length > 0);
    const visibleItems = visibleGroups.flatMap((group) => group.items);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const { collapsed, toggle: toggleCollapsed } = useSidebarCollapsed('offacto.sidebar.collapsed.admin');
    const activeHref = resolveSidebarActiveHref(url, visibleItems.length ? visibleItems : allNavItems);
    const sidebarNavRef = useRef(null);
    const sidebarExpanded = mobileNavOpen || !collapsed;

    useEffect(() => {
        document.documentElement.style.setProperty('--company-primary', '#0e1250');
        document.documentElement.style.setProperty('--company-secondary', '#64748b');
        document.documentElement.classList.toggle('dark', appearance === 'dark');
    }, [appearance]);

    useEffect(() => {
        setMobileNavOpen(false);
    }, [url]);

    useEffect(() => {
        if (!mobileNavOpen) {
            document.body.style.removeProperty('overflow');
            return undefined;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [mobileNavOpen]);

    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'Escape') {
                setMobileNavOpen(false);
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        const container = sidebarNavRef.current;
        const link = container?.querySelector('[data-nav-active="true"]');
        if (!container || !link) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => {
            link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });

        return () => cancelAnimationFrame(frame);
    }, [activeHref, url]);

    return (
        <div className="offacto-admin-shell">
            <I18nSync />
            <Head title={title ? `${title} · Admin` : 'Admin'} />
            <FlashToaster />
            <FormErrorsToaster />
            <div className="offacto-admin-shell__frame">
                <button
                    type="button"
                    className={`offacto-admin-sidebar-scrim${mobileNavOpen ? ' on' : ''}`}
                    aria-label={t('common.close')}
                    onClick={() => setMobileNavOpen(false)}
                />
                <aside
                    className={`offacto-admin-sidebar${mobileNavOpen ? ' is-open' : ''}${!mobileNavOpen && collapsed ? ' is-collapsed' : ''}`}
                >
                    <div className="offacto-admin-sidebar-brand">
                        <Link href="/admin" title="Admin">
                            <Logo variant="white" className="h-7 w-auto" />
                        </Link>
                        {sidebarExpanded && <p className="offacto-admin-sidebar-eyebrow">Platform</p>}
                    </div>
                    <nav
                        ref={sidebarNavRef}
                        className="offacto-admin-sidebar-nav"
                        aria-label="Admin navigation"
                    >
                        {visibleGroups.map((group) => (
                            <div key={group.label} className="offacto-admin-nav-group">
                                {sidebarExpanded && <p className="offacto-admin-navlbl">{group.label}</p>}
                                <div className="offacto-admin-nav">
                                    {group.items.map((item) => (
                                        <SidebarNavLink
                                            key={item.href}
                                            item={item}
                                            activeHref={activeHref}
                                            label={item.label}
                                            variant="admin"
                                            collapsed={!sidebarExpanded}
                                            onNavigate={() => setMobileNavOpen(false)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                    <div className="offacto-admin-sidebar-foot">
                        <button
                            type="button"
                            onClick={toggleCollapsed}
                            aria-expanded={!collapsed}
                            title={collapsed ? t('nav.expand_sidebar') : t('nav.collapse_sidebar')}
                            className={`offacto-admin-nav-collapse${collapsed ? ' is-collapsed' : ''}`}
                        >
                            <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} />
                            {!collapsed && <span>{t('nav.collapse_sidebar')}</span>}
                        </button>
                    </div>
                </aside>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <AdminTopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
                    <div className="offacto-admin-scroll">
                        <div className="offacto-admin-page">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
