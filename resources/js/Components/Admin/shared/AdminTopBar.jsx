import { Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../Icon';
import { t } from '../../../lib/i18n';
import AdminNotificationsDrawer from './AdminNotificationsDrawer';

function SearchIcon() {
    return (
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
        </svg>
    );
}

function initials(name = '') {
    return (
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('') || 'A'
    );
}

/** Primary admin top bar — global search, notifications, profile (SH-004 / SH-005 / SH-015). */
export default function AdminTopBar({ onOpenMobileNav }) {
    const { auth, adminShell } = usePage().props;
    const user = auth?.user;
    const notifications = adminShell?.notifications || [];
    const banner = adminShell?.environmentBanner;

    const [q, setQ] = useState('');
    const [results, setResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const debounce = useRef(null);
    const menuRef = useRef(null);

    const fetchResults = useCallback((query) => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        setSearchLoading(true);
        window.axios
            .get('/admin/search', { params: { q: query } })
            .then((res) => setResults(res.data.results || []))
            .catch(() => setResults([]))
            .finally(() => setSearchLoading(false));
    }, []);

    useEffect(() => {
        clearTimeout(debounce.current);
        debounce.current = setTimeout(() => fetchResults(q.trim()), 280);
        return () => clearTimeout(debounce.current);
    }, [q, fetchResults]);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const onDocClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [menuOpen]);

    const unread = notifications.length;

    return (
        <>
            {banner?.show && (
                <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-[11px] font-medium text-amber-900 lg:px-8">
                    Environment: {banner.label} — live payment and destructive operations may be restricted.
                </div>
            )}
            <header className="relative z-50 flex shrink-0 items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur-sm lg:px-8">
                <button
                    type="button"
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-50 lg:hidden"
                    aria-label="Open navigation"
                    onClick={onOpenMobileNav}
                >
                    <Icon name="grid" className="h-5 w-5" />
                </button>
                <div className="relative min-w-0 flex-1 max-w-xl">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                        <SearchIcon />
                    </span>
                    <input
                        type="search"
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setSearchOpen(true);
                        }}
                        onFocus={() => setSearchOpen(true)}
                        onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                        placeholder="Search companies, accounts, or plan payments"
                        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        aria-expanded={searchOpen}
                        aria-controls="admin-topbar-search-results"
                    />
                    {searchOpen && q.trim().length >= 2 && (
                        <ul
                            id="admin-topbar-search-results"
                            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-lg"
                        >
                            {searchLoading && <li className="px-3 py-2 text-xs text-slate-400">Searching…</li>}
                            {!searchLoading && results.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">No results</li>}
                            {results.map((row, i) => (
                                <li key={`${row.type}-${i}`}>
                                    <button
                                        type="button"
                                        className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-slate-50"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                            setSearchOpen(false);
                                            setQ('');
                                            router.visit(row.href);
                                        }}
                                    >
                                        <span className="font-medium text-slate-900">{row.label}</span>
                                        <span className="text-xs text-slate-500">
                                            {row.type} · {row.meta}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setNotificationsOpen(true)}
                        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-50"
                        aria-label="Notifications"
                        aria-expanded={notificationsOpen}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
                            <path strokeLinecap="round" d="M9 17a3 3 0 0 0 6 0" />
                        </svg>
                        {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />}
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            className="flex items-center gap-3 rounded-full py-1 pl-2 pr-1 hover:bg-slate-50"
                            aria-expanded={menuOpen}
                            aria-haspopup="menu"
                        >
                            <span className="hidden text-right sm:block">
                                <span className="block text-sm font-semibold text-slate-900">{user?.name}</span>
                                <span className="block text-xs text-slate-400">Platform admin</span>
                            </span>
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                                {initials(user?.name)}
                            </span>
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 z-[60] mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl" role="menu">
                                <div className="border-b border-slate-100 px-4 py-3">
                                    <div className="truncate text-sm font-semibold text-slate-900">{user?.name}</div>
                                    <div className="truncate text-xs text-slate-400">{user?.email}</div>
                                </div>
                                <div className="p-1.5">
                                    {user?.id && (
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                                            role="menuitem"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <Icon name="customers" className="h-4 w-4 opacity-70" />
                                            Your admin profile
                                        </Link>
                                    )}
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                                        role="menuitem"
                                    >
                                        <Icon name="logout" className="h-4 w-4" />
                                        {t('topbar.logout')}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <AdminNotificationsDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} items={notifications} />
        </>
    );
}
