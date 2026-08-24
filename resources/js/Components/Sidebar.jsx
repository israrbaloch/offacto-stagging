import { Link, usePage } from '@inertiajs/react';
import { t } from '../lib/i18n';
import CompanySwitcher from './CompanySwitcher';
import Icon from './Icon';
import Logo from './Logo';

const mainNav = [
    { href: '/dashboard', label: 'nav.dashboard', icon: 'grid', exact: true },
    { href: '/companies', label: 'nav.companies', icon: 'building' },
    { href: '/customers', label: 'nav.customers', icon: 'customers' },
    { href: '/services', label: 'nav.services', icon: 'wrench' },
    { href: '/briefings', label: 'nav.briefings', icon: 'clipboard' },
    { href: '/offers', label: 'nav.offers', icon: 'document' },
    { href: '/invoices', label: 'nav.invoices', icon: 'invoice' },
];

const footerNav = [
    { href: '/support', label: 'nav.support', icon: 'help' },
    { href: '/settings', label: 'nav.settings', icon: 'settings', aliases: ['/profile'] },
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
            {t(item.label)}
        </Link>
    );
}

export default function Sidebar() {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const appearance = props.appearance;
    void props.locale;

    return (
        <aside className="hidden h-full w-[250px] shrink-0 flex-col overflow-y-auto rounded-l-3xl bg-indigo-50 lg:flex">
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
                    {t('nav.create_invoice')}
                </Link>
            </div>

            <nav className="mt-6 space-y-1 px-3 pb-6">
                {mainNav.map((item) => (
                    <NavLink key={item.href} item={item} url={url} />
                ))}
                {user?.is_admin && (
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-white/70"
                    >
                        {t('nav.admin')}
                    </Link>
                )}
                <div className="my-3 border-t border-indigo-100" />
                {footerNav.map((item) => (
                    <NavLink key={item.href} item={item} url={url} />
                ))}
            </nav>
        </aside>
    );
}
