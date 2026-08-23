import { Link, usePage } from '@inertiajs/react';
import CompanySwitcher from './CompanySwitcher';

function Icon({ name, className = 'h-[18px] w-[18px]' }) {
    const props = {
        className,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '1.8',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        viewBox: '0 0 24 24',
    };

    const paths = {
        grid: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1.2" />
                <rect x="14" y="3" width="7" height="7" rx="1.2" />
                <rect x="3" y="14" width="7" height="7" rx="1.2" />
                <rect x="14" y="14" width="7" height="7" rx="1.2" />
            </>
        ),
        customers: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),
        building: (
            <>
                <path d="M3 21h18" />
                <path d="M5 21V7l7-4 7 4v14" />
                <path d="M9 21v-6h6v6" />
            </>
        ),
        document: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 13h8" />
                <path d="M8 17h5" />
            </>
        ),
        invoice: (
            <>
                <path d="M4 2h16v20l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
            </>
        ),
        wrench: (
            <path d="M14.7 6.3a4.1 4.1 0 0 0-5.8 5.6L3 18l3 3 5.9-5.9a4.1 4.1 0 0 0 5.6-5.8l-3.2 3.2-2.8-2.8z" />
        ),
        help: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M9.6 9.4a2.4 2.4 0 1 1 3.7 2c-.8.5-1.3 1-1.3 1.8V14" />
                <circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none" />
            </>
        ),
        settings: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
            </>
        ),
    };

    return <svg {...props}>{paths[name]}</svg>;
}

const mainNav = [
    { href: '/dashboard', label: 'Dashboard', icon: 'grid', exact: true },
    { href: '/companies', label: 'Companies', icon: 'building' },
    { href: '/customers', label: 'Customers', icon: 'customers' },
    { href: '/services', label: 'Services', icon: 'wrench' },
    { href: '/offers', label: 'Offers', icon: 'document' },
    { href: '/invoices', label: 'Invoices', icon: 'invoice' },
];

const footerNav = [
    { href: '/support', label: 'Support', icon: 'help' },
    { href: '/settings', label: 'Settings', icon: 'settings' },
];

function isActive(url, item) {
    if (item.exact) {
        return url === item.href;
    }
    return url === item.href || url.startsWith(`${item.href}/`);
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

    return (
        <aside className="hidden w-[250px] shrink-0 flex-col rounded-l-3xl bg-indigo-50 lg:flex">
            <div className="px-5 pt-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                        O
                    </span>
                    <span>
                        <span className="block text-base font-semibold text-slate-900">Offacto</span>
                        <span className="block text-xs text-slate-400">SaaS Invoicing</span>
                    </span>
                </Link>
                <div className="mt-4">
                    <CompanySwitcher />
                </div>
                <Link
                    href="/invoices/create"
                    className="mt-4 flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    + Create Invoice
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
