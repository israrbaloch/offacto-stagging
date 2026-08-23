import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import CompanySwitcher from '../Components/CompanySwitcher';
import Toast from '../Components/Toast';

const nav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/companies', label: 'Companies' },
    { href: '/customers', label: 'Customers' },
    { href: '/services', label: 'Services' },
    { href: '/offers', label: 'Offers' },
    { href: '/invoices', label: 'Invoices' },
    { href: '/profile', label: 'Profile' },
];

export default function AuthenticatedLayout({ title, children }) {
    const { auth, activeCompany } = usePage().props;
    const user = auth?.user;
    const primary = activeCompany?.theme?.primary || '#4f46e5';
    const secondary = activeCompany?.theme?.secondary || '#0f172a';

    useEffect(() => {
        document.documentElement.style.setProperty('--company-primary', primary);
        document.documentElement.style.setProperty('--company-secondary', secondary);
    }, [primary, secondary]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={title} />
            <Toast />
            <div className="flex min-h-screen">
                <aside className="hidden w-64 shrink-0 flex-col bg-[var(--company-secondary)] text-white lg:flex">
                    <div className="px-5 py-6">
                        <Link href="/dashboard" className="text-lg font-semibold">
                            Offacto
                        </Link>
                        <div className="mt-4">
                            <CompanySwitcher />
                        </div>
                    </div>
                    <nav className="flex-1 space-y-1 px-3">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ))}
                        {user?.is_admin && (
                            <Link
                                href="/admin"
                                className="block rounded-lg px-3 py-2 text-sm text-amber-200 hover:bg-white/10"
                            >
                                Admin
                            </Link>
                        )}
                    </nav>
                    <div className="border-t border-white/10 px-5 py-4 text-sm text-white/70">
                        <div className="font-medium text-white">{user?.name}</div>
                        <div className="truncate">{user?.email}</div>
                        <Link href="/logout" method="post" as="button" className="mt-3 text-sm text-white/80 hover:text-white">
                            Log out
                        </Link>
                    </div>
                </aside>
                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
                        <div className="lg:hidden">
                            <Link href="/dashboard" className="font-semibold">
                                Offacto
                            </Link>
                        </div>
                        <div className="text-sm text-slate-500">{activeCompany?.company_name || 'No company selected'}</div>
                        <Link href="/profile" className="text-sm font-medium text-slate-700">
                            {user?.name}
                        </Link>
                    </header>
                    <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
