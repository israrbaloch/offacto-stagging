import { Link } from '@inertiajs/react';
import Icon from './Icon';
import { t } from '../lib/i18n';

/** Shared staff + admin sidebar link appearance (admin shell styles). */
export function normalizeSidebarPath(path) {
    const base = (path || '').split('?')[0].split('#')[0];
    if (base.length > 1 && base.endsWith('/')) {
        return base.slice(0, -1);
    }
    return base || '/';
}

export function resolveSidebarActiveHref(currentUrl, items) {
    const path = normalizeSidebarPath(currentUrl);
    let bestHref = null;
    let bestLength = -1;

    for (const item of items) {
        const href = normalizeSidebarPath(item.href);
        let matches = false;

        if (item.exact) {
            matches = path === href;
        } else {
            const aliases = item.aliases || [];
            matches =
                path === href ||
                path.startsWith(`${href}/`) ||
                aliases.some((a) => path === a || path.startsWith(`${normalizeSidebarPath(a)}/`));
        }

        if (item.comingSoon) {
            continue;
        }

        if (matches && href.length > bestLength) {
            bestHref = item.href;
            bestLength = href.length;
        }
    }

    return bestHref;
}

export default function SidebarNavLink({
    item,
    activeHref,
    onNavigate,
    label,
    collapsed = false,
    variant = 'light',
    count,
    badge,
    showTimerDot = false,
}) {
    const active = normalizeSidebarPath(item.href) === normalizeSidebarPath(activeHref || '');

    if (item.comingSoon && variant === 'offacto') {
        return (
            <span className="offacto-nav-soon" aria-disabled="true">
                <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                <span className="min-w-0 flex-1 truncate text-inherit">{label}</span>
                <span className="nav-new">{t('nav.coming_soon')}</span>
            </span>
        );
    }

    if (variant === 'offacto') {
        return (
            <Link
                href={item.href}
                onClick={onNavigate}
                data-nav-active={active ? 'true' : undefined}
                className={active ? 'on' : undefined}
            >
                <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                <span className="min-w-0 flex-1 truncate text-inherit">{label}</span>
                <span className="offacto-nav-trail">
                    {count != null && count > 0 ? <span className="nav-cnt">{count}</span> : null}
                    {badge ? <span className="nav-new">{badge}</span> : null}
                    {showTimerDot ? (
                        <span
                            className="nav-timer-dot"
                            title={t('time.timer_running_indicator')}
                            aria-label={t('time.timer_running_indicator')}
                        />
                    ) : null}
                </span>
            </Link>
        );
    }

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            data-nav-active={active ? 'true' : undefined}
            className={`flex items-center rounded-xl py-2 text-[13px] transition ${
                collapsed ? 'justify-center px-2' : 'gap-2.5 px-3'
            } ${
                active
                    ? 'bg-white font-medium text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
        >
            <Icon name={item.icon} className="h-[17px] w-[17px] shrink-0 opacity-80" />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}
