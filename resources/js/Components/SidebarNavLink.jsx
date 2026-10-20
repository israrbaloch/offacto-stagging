import { Link } from '@inertiajs/react';
import Icon from './Icon';

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

        if (matches && href.length > bestLength) {
            bestHref = item.href;
            bestLength = href.length;
        }
    }

    return bestHref;
}

export default function SidebarNavLink({ item, activeHref, onNavigate, label, collapsed = false }) {
    const active = normalizeSidebarPath(item.href) === normalizeSidebarPath(activeHref || '');

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
