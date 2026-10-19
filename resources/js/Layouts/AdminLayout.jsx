import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import FlashToaster from '../Components/FlashToaster';
import FloatingFavicons from '../Components/FloatingFavicons';
import Icon from '../Components/Icon';
import I18nSync from '../Components/I18nSync';
import Logo from '../Components/Logo';

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
        ],
    },
    {
        label: 'Billing',
        items: [
            { href: '/admin/subscriptions', label: 'Subscriptions', icon: 'invoice', exact: true },
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
            { href: '/admin/support', label: 'Support hub', icon: 'help', exact: true },
            { href: '/admin/support/tickets', label: 'Tickets', icon: 'clipboard' },
        ],
    },
    {
        label: 'Security',
        items: [
            { href: '/admin/security', label: 'Security hub', icon: 'settings', exact: true },
            { href: '/admin/security/operations/fraud-queue', label: 'Fraud queue', icon: 'clipboard' },
        ],
    },
    {
        label: 'Infrastructure',
        items: [
            { href: '/admin/infrastructure', label: 'Infrastructure hub', icon: 'grid', exact: true },
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

function isActive(url, item) {
    const path = url.split('?')[0];
    if (item.exact) {
        return path === item.href || path === `${item.href}/`;
    }
    return path === item.href || path.startsWith(`${item.href}/`);
}

function NavLink({ item, url }) {
    const active = isActive(url, item);

    return (
        <Link
            href={item.href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition ${
                active ? 'bg-white font-medium text-slate-900 shadow-sm ring-1 ring-slate-200/80' : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
        >
            <Icon name={item.icon} className="h-[17px] w-[17px] shrink-0 opacity-80" />
            <span className="truncate">{item.label}</span>
        </Link>
    );
}

export default function AdminLayout({ title = 'Admin', children }) {
    const { url, props } = usePage();
    const appearance = props.appearance;

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
                <aside className="auth-aside-bg relative hidden h-full w-[240px] shrink-0 flex-col overflow-hidden border-r border-white/40 lg:flex">
                    <FloatingFavicons count={5} minSize={20} maxSize={64} />
                    <div className="relative z-10 px-4 pt-5">
                        <Link href="/admin" className="flex items-center justify-center">
                            <Logo variant={appearance === 'dark' ? 'white' : 'dark'} className="h-7 w-auto" />
                        </Link>
                        <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Platform</p>
                    </div>
                    <nav className="relative z-10 mt-2 flex-1 space-y-5 overflow-y-auto px-3 pb-6">
                        {navGroups.map((group) => (
                            <div key={group.label}>
                                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/90">{group.label}</p>
                                <div className="space-y-0.5">
                                    {group.items.map((item) => (
                                        <NavLink key={item.href} item={item} url={url} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white lg:rounded-l-none">{children}</div>
            </div>
        </div>
    );
}
