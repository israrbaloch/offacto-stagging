import { Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../Icon';
import { applyTheme } from '../../../lib/applyTheme';
import { t } from '../../../lib/i18n';
import AdminNotificationsDrawer from './AdminNotificationsDrawer';
import AdminSearchOverlay from './AdminSearchOverlay';

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

function SearchResultsList({ results, loading, onSelect }) {
    if (loading) {
        return <li className="px-3 py-2 text-xs text-slate-400">Searching…</li>;
    }
    if (results.length === 0) {
        return <li className="px-3 py-2 text-xs text-slate-400">No results</li>;
    }
    return results.map((row, index) => (
        <li key={`${row.type}-${index}`}>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => onSelect(row)}>
                <span className="label">{row.label}</span>
                <span className="meta">
                    {row.type} · {row.meta}
                </span>
            </button>
        </li>
    ));
}

/** Primary admin top bar — global search, notifications, profile (SH-004 / SH-005 / SH-015). */
export default function AdminTopBar({ onOpenMobileNav }) {
    const { auth, adminShell, appearance } = usePage().props;
    const user = auth?.user;
    const notifications = adminShell?.notifications || [];
    const banner = adminShell?.environmentBanner;

    const [q, setQ] = useState('');
    const [results, setResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const debounce = useRef(null);
    const menuRef = useRef(null);
    const searchDesktopRef = useRef(null);

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
        if (!menuOpen) {
            return undefined;
        }
        const onDocClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [menuOpen]);

    useEffect(() => {
        const onKey = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                if (window.matchMedia('(max-width: 1023px)').matches) {
                    setSearchOverlayOpen(true);
                } else {
                    searchDesktopRef.current?.focus();
                }
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    const pickResult = (row) => {
        setSearchOpen(false);
        setQ('');
        setResults([]);
        router.visit(row.href);
    };

    const unread = notifications.length;

    return (
        <>
            {banner?.show && (
                <div className="offacto-admin-env-banner">
                    Environment: {banner.label} — live payment and destructive operations may be restricted.
                </div>
            )}
            <div className="offacto-admin-topbar-shell">
                <header className="offacto-admin-topbar">
                    <button
                        type="button"
                        className="offacto-admin-topbar-icobtn lg:hidden"
                        aria-label="Open navigation"
                        onClick={onOpenMobileNav}
                    >
                        <Icon name="menu" />
                    </button>
                    <button
                        type="button"
                        className="offacto-admin-topbar-icobtn offacto-admin-topbar-search-trigger"
                        aria-label="Search"
                        onClick={() => {
                            setMenuOpen(false);
                            setNotificationsOpen(false);
                            setSearchOverlayOpen(true);
                        }}
                    >
                        <Icon name="search" />
                    </button>
                    <div className="offacto-admin-topbar-search-desktop">
                        <span className="offacto-admin-topbar-search-icon" aria-hidden="true">
                            <Icon name="search" />
                        </span>
                        <input
                            ref={searchDesktopRef}
                            type="search"
                            value={q}
                            onChange={(event) => {
                                setQ(event.target.value);
                                setSearchOpen(true);
                            }}
                            onFocus={() => setSearchOpen(true)}
                            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                            placeholder="Search companies, accounts, or plan payments"
                            aria-expanded={searchOpen}
                            aria-controls="admin-topbar-search-results"
                        />
                        {searchOpen && q.trim().length >= 2 && (
                            <ul id="admin-topbar-search-results" className="offacto-admin-topbar-search-results">
                                <SearchResultsList results={results} loading={searchLoading} onSelect={pickResult} />
                            </ul>
                        )}
                    </div>

                    <div className="offacto-admin-topbar-spacer" aria-hidden="true" />

                    <div className="offacto-admin-topbar-actions">
                        <button
                            type="button"
                            className="offacto-admin-topbar-icobtn"
                            onClick={() => {
                                const next = appearance === 'dark' ? 'light' : 'dark';
                                applyTheme(next);
                                router.post('/theme', { theme: next }, { preserveScroll: true });
                            }}
                            aria-label={appearance === 'dark' ? t('theme.to_light') : t('theme.to_dark')}
                        >
                            <Icon name={appearance === 'dark' ? 'sun' : 'moon'} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setNotificationsOpen(true);
                                setMenuOpen(false);
                            }}
                            className="offacto-admin-topbar-icobtn relative"
                            aria-label="Notifications"
                            aria-expanded={notificationsOpen}
                        >
                            <Icon name="bell" />
                            {unread > 0 ? <span className="offacto-admin-topbar-dot" aria-hidden="true" /> : null}
                        </button>
                        <div className="offacto-admin-topbar-me" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen((open) => !open);
                                    setNotificationsOpen(false);
                                }}
                                className="offacto-admin-topbar-avatar"
                                aria-expanded={menuOpen}
                                aria-haspopup="menu"
                                title={user?.name}
                            >
                                {initials(user?.name)}
                            </button>
                            {menuOpen && (
                                <div className="offacto-admin-topbar-me-menu" role="menu">
                                    <div className="offacto-admin-topbar-me-head">
                                        <div className="offacto-admin-topbar-me-name truncate">{user?.name}</div>
                                        <div className="offacto-admin-topbar-me-email truncate">{user?.email}</div>
                                    </div>
                                    <div className="p-1.5">
                                        {user?.id && (
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="offacto-admin-topbar-me-link"
                                                role="menuitem"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <Icon name="customers" className="h-4 w-4 opacity-80" />
                                                Your admin profile
                                            </Link>
                                        )}
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="offacto-admin-topbar-me-link is-danger"
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
            </div>
            <AdminSearchOverlay
                open={searchOverlayOpen}
                query={q}
                onQueryChange={setQ}
                onClose={() => setSearchOverlayOpen(false)}
                results={results}
                loading={searchLoading}
                onSelectResult={pickResult}
            />
            <AdminNotificationsDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} items={notifications} />
        </>
    );
}
