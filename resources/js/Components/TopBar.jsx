import { Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';
import Icon from './Icon';
import LocaleSelect from './LocaleSelect';
import TopBarNotifications from './TopBarNotifications';
import TopBarSearchOverlay from './TopBarSearchOverlay';
import { applyTheme } from '../lib/applyTheme';
import { COMPANY_PLAN_SETTINGS_PATH } from '../lib/companyPlanSettingsPath';

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('') || 'U';
}

export default function TopBar({ onMenuClick }) {
    const { auth, activeCompany, appearance, workspaceShell } = usePage().props;
    const user = auth?.user;
    const notifications = workspaceShell?.notifications ?? [];
    const hasUnread = notifications.length > 0;

    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
    const profileRef = useRef(null);
    const bellRef = useRef(null);
    const searchRef = useRef(null);

    const openSearch = useCallback(() => {
        setProfileOpen(false);
        setNotificationsOpen(false);
        setSearchOverlayOpen(true);
    }, []);

    const submitSearch = (event) => {
        event.preventDefault();
        if (!searchQuery.trim()) {
            return;
        }
        setSearchOverlayOpen(false);
        router.get('/search', { q: searchQuery.trim() });
    };

    useEffect(() => {
        function onClick(event) {
            if (!profileRef.current?.contains(event.target)) {
                setProfileOpen(false);
            }
        }

        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    useEffect(() => {
        const onKey = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
                    openSearch();
                } else {
                    searchRef.current?.focus();
                }
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [openSearch]);

    const trialBadge = (() => {
        if (!activeCompany || auth?.user?.is_admin) return null;
        if (activeCompany.subscription_valid && activeCompany.subscription_plan) {
            return (
                <Link href={COMPANY_PLAN_SETTINGS_PATH} className="offacto-topbar-trial hidden sm:inline">
                    {t(`upgrade.plans.${activeCompany.subscription_plan}.name`)}
                </Link>
            );
        }
        if (activeCompany.trial_expired) {
            return (
                <Link href={COMPANY_PLAN_SETTINGS_PATH} className="offacto-topbar-trial hidden sm:inline">
                    {t('topbar.trial_ended')}
                </Link>
            );
        }
        return (
            <Link href={COMPANY_PLAN_SETTINGS_PATH} className="offacto-topbar-trial hidden sm:inline">
                {t('topbar.trial_short', { days: activeCompany.trial_days_left ?? 0 })}
            </Link>
        );
    })();

    return (
        <div className="offacto-topbar-shell">
            <header className="offacto-topbar">
                <button
                    type="button"
                    className="offacto-topbar-icobtn offacto-topbar-menu lg:hidden"
                    aria-label={t('topbar.menu')}
                    onClick={(event) => {
                        event.stopPropagation();
                        onMenuClick?.();
                    }}
                >
                    <Icon name="menu" />
                </button>
                <button
                    type="button"
                    className="offacto-topbar-icobtn offacto-topbar-search-trigger"
                    aria-label={t('topbar.search')}
                    onClick={openSearch}
                >
                    <Icon name="search" />
                </button>
                <form className="offacto-topbar-search offacto-topbar-search-desktop" onSubmit={submitSearch}>
                    <Icon name="search" />
                    <input
                        ref={searchRef}
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={t('topbar.search')}
                        aria-label={t('topbar.search')}
                    />
                    <span className="offacto-topbar-kbd hidden md:inline">⌘K</span>
                </form>

                <div className="offacto-topbar-spacer" aria-hidden="true" />

                <div className="offacto-topbar-actions">
                    {trialBadge}
                    <LocaleSelect variant="topbar" />
                    <button
                        type="button"
                        className="offacto-topbar-icobtn"
                        onClick={() => {
                            const next = appearance === 'dark' ? 'light' : 'dark';
                            applyTheme(next);
                            router.post('/theme', { theme: next }, { preserveScroll: true });
                        }}
                        aria-label={appearance === 'dark' ? t('theme.to_light') : t('theme.to_dark')}
                        title={appearance === 'dark' ? t('theme.light') : t('theme.dark')}
                    >
                        <Icon name={appearance === 'dark' ? 'sun' : 'moon'} />
                    </button>

                    <div className="offacto-topbar-notifications-wrap">
                        <button
                            ref={bellRef}
                            type="button"
                            className="offacto-topbar-icobtn"
                            aria-label={t('topbar.notifications')}
                            aria-expanded={notificationsOpen}
                            onClick={(event) => {
                                event.stopPropagation();
                                setNotificationsOpen((open) => !open);
                                setProfileOpen(false);
                            }}
                        >
                            <Icon name="bell" />
                            {hasUnread ? <span className="offacto-topbar-dot" aria-hidden="true" /> : null}
                        </button>
                        <TopBarNotifications
                            open={notificationsOpen}
                            onClose={() => setNotificationsOpen(false)}
                            anchorRef={bellRef}
                        />
                    </div>

                    <div className="relative" ref={profileRef}>
                        <button
                            type="button"
                            className="offacto-topbar-me-avatar"
                            aria-label={user?.name || t('topbar.profile')}
                            aria-expanded={profileOpen}
                            title={user?.name}
                            onClick={() => {
                                setProfileOpen((open) => !open);
                                setNotificationsOpen(false);
                            }}
                        >
                            {initials(user?.name)}
                        </button>

                        {profileOpen && (
                            <div className="offacto-topbar-me-menu absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl shadow-xl">
                                <div className="offacto-topbar-me-head flex items-center gap-3 px-4 py-3">
                                    <span className="offacto-topbar-me-avatar">{initials(user?.name)}</span>
                                    <div className="min-w-0">
                                        <div className="offacto-topbar-me-name truncate text-sm font-semibold">{user?.name}</div>
                                        <div className="offacto-topbar-me-email truncate text-xs">{user?.email}</div>
                                    </div>
                                </div>
                                <div className="p-1.5">
                                    <Link
                                        href="/profile"
                                        onClick={() => setProfileOpen(false)}
                                        className="offacto-topbar-me-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
                                    >
                                        <span className="offacto-topbar-me-ico">
                                            <Icon name="user" className="h-4 w-4" />
                                        </span>
                                        {t('topbar.profile')}
                                    </Link>
                                </div>
                                <div className="offacto-topbar-me-foot p-1.5">
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        onClick={() => setProfileOpen(false)}
                                        className="offacto-topbar-me-link is-danger flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm"
                                    >
                                        <span className="offacto-topbar-me-ico is-danger">
                                            <Icon name="logout" className="h-4 w-4" />
                                        </span>
                                        {t('topbar.logout')}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <TopBarSearchOverlay
                open={searchOverlayOpen}
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onClose={() => setSearchOverlayOpen(false)}
            />
        </div>
    );
}
