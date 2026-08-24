import { Link, usePage } from '@inertiajs/react';
import CompanySwitcher from './CompanySwitcher';
import Icon from './Icon';
import Logo from './Logo';

const mainNav = [
    { href: '/dashboard', label: 'Dashboard', icon: 'grid', exact: true },
    { href: '/companies', label: 'Companies', icon: 'building' },
    { href: '/customers', label: 'Customers', icon: 'customers' },
    { href: '/services', label: 'Services', icon: 'wrench' },
    { href: '/briefings', label: 'Briefings', icon: 'clipboard' },
    { href: '/offers', label: 'Offers', icon: 'document' },
    { href: '/invoices', label: 'Invoices', icon: 'invoice' },
];

const footerNav = [
    { href: '/support', label: 'Support', icon: 'help' },
    { href: '/settings', label: 'Settings', icon: 'settings', aliases: ['/profile'] },
];

function isActive(url, item) {
    if (item.exact) {
        return url === item.href;
    }
    const matches = [item.href, ...(item.aliases || [])];
    return matches.some((href) => url === href || url.startsWith(`${href}/`));
}

function NavLink({ item, url }) {
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
            {item.label}
        </Link>
    );
}

export default function Sidebar() {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const appearance = props.appearance;

    return (
        <aside className="hidden w-[250px] shrink-0 flex-col rounded-l-3xl bg-indigo-50 lg:flex">
            <div className="px-5 pt-6">
                <Link href="/dashboard" className="flex justify-center">
                    <Logo variant={appearance === 'dark' ? 'white' : 'dark'} className="h-8 w-auto" />
                </Link>
                <div className="mt-5">
                    <CompanySwitcher />
                </div>
                <Link
                    href="/invoices/create"
                    className="mt-4 flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    <Icon name="plus" className="h-4 w-4" />
                    Create Invoice
                </Link>
            </div>

            <nav className="mt-6 flex-1 space-y-1 px-3">
                {mainNav.map((item) => (
                    <NavLink key={item.href} item={item} url={url} />
                ))}
                {user?.is_admin && (
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-white/70"
                    >
                        Admin
                    </Link>
                )}
            </nav>

            <div className="mt-auto space-y-1 border-t border-indigo-100 px-3 py-4">
                {footerNav.map((item) => (
                    <NavLink key={item.href} item={item} url={url} />
                ))}
            </div>
        </aside>
    );
}
