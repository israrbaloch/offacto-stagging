import { Head, Link, usePage } from '@inertiajs/react';
import Logo from '../Components/Logo';
import Toast from '../Components/Toast';

const nav = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/companies', label: 'Companies' },
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ title, children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-slate-100">
            <Head title={title} />
            <Toast />
            <header className="border-b border-slate-200 bg-slate-900 text-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-6">
                        <Link href="/admin" className="flex items-center gap-3">
                            <Logo variant="white" className="h-7 w-auto" />
                            <span className="text-sm font-medium text-white/80">Admin</span>
                        </Link>
                        <nav className="hidden gap-4 text-sm text-white/80 md:flex">
                            {nav.map((item) => (
                                <Link key={item.href} href={item.href} className="hover:text-white">
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <Link href="/dashboard" className="text-white/80 hover:text-white">
                            App
                        </Link>
                        <span>{auth?.user?.name}</span>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
    );
}
