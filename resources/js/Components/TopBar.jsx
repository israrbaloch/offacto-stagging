import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';
import Icon from './Icon';
import LocaleSelect from './LocaleSelect';

function SearchIcon() {
    return (
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
        </svg>
    );
}

function HelpIcon() {
    return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M9.6 9.4a2.4 2.4 0 1 1 3.7 2c-.8.5-1.3 1-1.3 1.8V14" />
            <circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none" />
        </svg>
    );
}

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('') || 'U';
}

function roleLabel(user) {
    if (user?.is_admin) {
        return 'Admin';
    }
    if (user?.is_staff) {
        return 'Staff';
    }
    return user?.roles?.[0] || 'User';
}

export default function TopBar() {
    const { auth, activeCompany, appearance } = usePage().props;
    const user = auth?.user;
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const menuRef = useRef(null);
    useEffect(() => {
        function onClick(event) {
            if (!menuRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    return (
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 lg:rounded-tr-3xl lg:px-8">
            <form
                className="relative min-w-0 flex-1 max-w-xl"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (!searchQuery.trim()) return;
                    router.get('/search', { q: searchQuery.trim() });
                }}
            >
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <SearchIcon />
                </span>
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t('topbar.search')}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
            </form>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {activeCompany && !auth?.user?.is_admin && (
                    activeCompany.subscription_plan ? (
                        <Link
                            href="/upgrade"
                            className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 sm:inline"
                        >
                            {t(`upgrade.plans.${activeCompany.subscription_plan}.name`)}
                        </Link>
                    ) : activeCompany.trial_expired ? (
                        <Link
                            href="/upgrade"
                            className="hidden rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 sm:inline"
                        >
                            {t('topbar.trial_ended')} · {t('layout.upgrade_now')}
                        </Link>
                    ) : (
                        <Link
                            href="/upgrade"
                            className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 sm:inline"
                        >
                            {t('topbar.trial_left', { days: activeCompany.trial_days_left ?? 0 })}
                        </Link>
                    )
                )}
                <button
                    type="button"
                    onClick={() => {
                        const next = appearance === 'dark' ? 'light' : 'dark';
                        document.documentElement.classList.toggle('dark', next === 'dark');
                        router.post('/theme', { theme: next }, { preserveScroll: true, preserveState: true });
                    }}
                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                    aria-label={appearance === 'dark' ? t('theme.to_light') : t('theme.to_dark')}
                    title={appearance === 'dark' ? t('theme.light') : t('theme.dark')}
                >
                    <Icon name={appearance === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
                </button>
                <LocaleSelect />
                <Link
                    href="/support"
                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                    aria-label={t('topbar.help')}
                >
                    <HelpIcon />
                </Link>

                <span className="mx-2 hidden h-8 w-px bg-slate-200 sm:block" />

                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        className="flex items-center gap-3 rounded-full py-1 pl-2 pr-1 transition hover:bg-slate-50"
                    >
                        <span className="hidden text-right sm:block">
                            <span className="block text-sm font-semibold text-slate-900">{user?.name}</span>
                            <span className="block text-xs capitalize text-slate-400">{roleLabel(user)}</span>
                        </span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                            {initials(user?.name)}
                        </span>
                    </button>

                    {open && (
                        <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                                    {initials(user?.name)}
                                </span>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-900">{user?.name}</div>
                                    <div className="truncate text-xs text-slate-400">{user?.email}</div>
                                </div>
                            </div>
                            <div className="p-1.5">
                                <Link
                                    href="/profile"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                        <Icon name="user" className="h-4 w-4" />
                                    </span>
                                    {t('topbar.profile')}
                                </Link>
                                <Link
                                    href="/settings"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                        <Icon name="settings" className="h-4 w-4" />
                                    </span>
                                    {t('topbar.settings')}
                                </Link>
                            </div>
                            <div className="border-t border-slate-100 p-1.5">
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
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
    );
}
