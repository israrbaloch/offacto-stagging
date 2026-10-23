import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';
import Icon from './Icon';
import LocaleSelect from './LocaleSelect';
import TimeTrackerWidget from './TimeTrackerWidget';
import TopBarNotifications from './TopBarNotifications';

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('') || 'U';
}

export default function TopBar() {
    const { auth, activeCompany, appearance, workspaceShell } = usePage().props;
    const user = auth?.user;
    const notifications = workspaceShell?.notifications ?? [];
    const hasUnread = notifications.length > 0;

    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const profileRef = useRef(null);
    const bellRef = useRef(null);
    const searchRef = useRef(null);

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
                searchRef.current?.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    const trialBadge = (() => {
        if (!activeCompany || auth?.user?.is_admin) return null;
        if (activeCompany.subscription_plan) {
            return (
                <Link href="/upgrade" className="offacto-topbar-trial hidden sm:inline">
                    {t(`upgrade.plans.${activeCompany.subscription_plan}.name`)}
                </Link>
            );
        }
        if (activeCompany.trial_expired) {
            return (
                <Link href="/upgrade" className="offacto-topbar-trial hidden sm:inline">
                    {t('topbar.trial_ended')}
                </Link>
            );
        }
        return (
            <Link href="/upgrade" className="offacto-topbar-trial hidden sm:inline">
                {t('topbar.trial_short', { days: activeCompany.trial_days_left ?? 0 })}
            </Link>
        );
    })();

    return (
        <div className="offacto-topbar-shell">
            <header className="offacto-topbar">
                <form
                    className="offacto-topbar-search"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!searchQuery.trim()) return;
                        router.get('/search', { q: searchQuery.trim() });
                    }}
                >
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
                    <div className="hidden md:flex">
                        <TimeTrackerWidget variant="topbar" />
                    </div>
                    {trialBadge}
                    <LocaleSelect variant="topbar" />
                    <button
                        type="button"
                        className="offacto-topbar-icobtn"
                        onClick={() => {
                            const next = appearance === 'dark' ? 'light' : 'dark';
                            document.documentElement.classList.toggle('dark', next === 'dark');
                            router.post('/theme', { theme: next }, { preserveScroll: true, preserveState: true });
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
                            <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[rgba(14,18,80,0.08)] bg-white text-[#0E1250] shadow-xl">
                                <div className="flex items-center gap-3 border-b border-[rgba(14,18,80,0.08)] px-4 py-3">
                                    <span className="offacto-topbar-me-avatar">{initials(user?.name)}</span>
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-[#0E1250]">{user?.name}</div>
                                        <div className="truncate text-xs text-[#48537F]">{user?.email}</div>
                                    </div>
                                </div>
                                <div className="p-1.5">
                                    <Link
                                        href="/profile"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#0E1250] hover:bg-[#EEEAFE]"
                                    >
                                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#EEEAFE] text-[#6B59DC]">
                                            <Icon name="user" className="h-4 w-4" />
                                        </span>
                                        {t('topbar.profile')}
                                    </Link>
                                    <Link
                                        href="/company/settings"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#0E1250] hover:bg-[#EEEAFE]"
                                    >
                                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#EEEAFE] text-[#6B59DC]">
                                            <Icon name="building" className="h-4 w-4" />
                                        </span>
                                        {t('topbar.company_settings')}
                                    </Link>
                                    <Link
                                        href="/support"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#0E1250] hover:bg-[#EEEAFE]"
                                    >
                                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#EEEAFE] text-[#6B59DC]">
                                            <Icon name="help" className="h-4 w-4" />
                                        </span>
                                        {t('topbar.help')}
                                    </Link>
                                </div>
                                <div className="border-t border-[rgba(14,18,80,0.08)] p-1.5">
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#F27D8C] hover:bg-[#F27D8C]/10"
                                    >
                                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F27D8C]/15 text-[#F27D8C]">
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
        </div>
    );
}
