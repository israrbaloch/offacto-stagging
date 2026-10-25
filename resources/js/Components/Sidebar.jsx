import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef } from 'react';
import { AuthDiamond } from '../Layouts/AuthSplitLayout';
import { t } from '../lib/i18n';
import CompanySwitcher from './CompanySwitcher';
import Icon from './Icon';
import SidebarCreateMenu from './SidebarCreateMenu';
import { COMPANY_PLAN_SETTINGS_PATH } from '../lib/companyPlanSettingsPath';
import SidebarNavLink, { normalizeSidebarPath, resolveSidebarActiveHref } from './SidebarNavLink';

const AUTH_MARK_SRC = '/assets/images/favicon.ico';

function buildNavGroups({ isAdmin, viewingCompany }) {
    const overview = [
        { href: '/dashboard', label: 'nav.dashboard', icon: 'grid', exact: true },
        ...(viewingCompany
            ? [{ href: '/assistant', label: 'nav.ai_assistant', icon: 'spark', comingSoon: true }]
            : []),
    ];

    const sales = viewingCompany
        ? [
              { href: '/briefings', label: 'nav.briefings', icon: 'clipboard' },
              { href: '/offers', label: 'nav.quotes', icon: 'offers' },
              { href: '/invoices', label: 'nav.invoices', icon: 'invoice', countKey: 'invoices' },
              { href: '/customers', label: 'nav.customers', icon: 'customers' },
          ]
        : [];

    const purchases = viewingCompany
        ? [{ href: '/purchases', label: 'nav.incoming_invoices', icon: 'inbox', comingSoon: true }]
        : [];

    const work = viewingCompany
        ? [
              { href: '/time', label: 'nav.time_tracking', icon: 'clock' },
              { href: '/services', label: 'nav.services_products', icon: 'services' },
          ]
        : [];

    const manage = [
        ...(viewingCompany
            ? [{ href: '/company/settings', label: 'nav.settings', icon: 'settings', aliases: ['/profile'] }]
            : []),
        { href: '/support', label: 'nav.support', icon: 'help' },
        ...(isAdmin ? [{ href: '/companies', label: 'nav.companies', icon: 'building' }] : []),
        ...(isAdmin ? [{ href: '/admin/dashboard', label: 'nav.offacto_admin', icon: 'shield' }] : []),
    ];

    return [
        { labelKey: 'nav.overview', items: overview },
        ...(sales.length ? [{ labelKey: 'nav.sales', items: sales }] : []),
        ...(purchases.length ? [{ labelKey: 'nav.purchases', items: purchases }] : []),
        ...(work.length ? [{ labelKey: 'nav.work', items: work }] : []),
        { labelKey: 'nav.manage', items: manage },
    ];
}

function trialFoot(activeCompany) {
    if (!activeCompany || activeCompany.subscription_valid) {
        return null;
    }

    const left = Math.max(0, activeCompany.trial_days_left ?? 0);
    const total = Math.max(1, activeCompany.trial_days_total ?? 14);
    const elapsed = Math.min(total, Math.max(0, total - left));
    const percent =
        activeCompany.trial_expired || left === 0
            ? 100
            : Math.min(100, Math.max(4, (elapsed / total) * 100));

    return { percent, left, total };
}

function flattenItems(groups) {
    return groups.flatMap((group) => group.items);
}

export default function Sidebar({ onNavigate }) {
    const { url, props } = usePage();
    const { auth, activeCompany } = props;
    const isAdmin = Boolean(auth?.user?.is_admin);
    const viewingCompany = Boolean(activeCompany);
    const sidebarNavRef = useRef(null);

    const groups = useMemo(() => buildNavGroups({ isAdmin, viewingCompany }), [isAdmin, viewingCompany]);
    const allNavItems = useMemo(() => flattenItems(groups), [groups]);
    const activeHref = resolveSidebarActiveHref(url, allNavItems);
    const trial = trialFoot(activeCompany);
    const sidebarCounts = props.workspaceShell?.sidebarCounts ?? {};
    const timerRunning = Boolean(props.timeTracking?.running);
    const onTimePage = normalizeSidebarPath(url) === '/time';

    useEffect(() => {
        const container = sidebarNavRef.current;
        const link = container?.querySelector('[data-nav-active="true"]');
        if (!container || !link) {
            return;
        }

        const frame = requestAnimationFrame(() => {
            const linkRect = link.getBoundingClientRect();
            const navRect = container.getBoundingClientRect();
            const padding = 8;
            const fullyVisible = linkRect.top >= navRect.top + padding && linkRect.bottom <= navRect.bottom - padding;

            if (!fullyVisible) {
                link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });

        return () => cancelAnimationFrame(frame);
    }, [activeHref, url]);

    const planLabel = (() => {
        if (!activeCompany) return null;
        if (activeCompany.subscription_valid && activeCompany.subscription_plan) {
            return t(`upgrade.plans.${activeCompany.subscription_plan}.name`);
        }
        if (!activeCompany.subscription_valid && !activeCompany.trial_expired) {
            return t('sidebar.trial');
        }
        return null;
    })();

    return (
        <aside
            className="offacto-sidebar sticky top-0 z-auto hidden h-full max-h-[100dvh] w-[256px] shrink-0 flex-col overflow-hidden md:flex"
        >
            <AuthDiamond size={60} className="pointer-events-none absolute -right-3.5 top-[180px]" />
            <AuthDiamond size={28} delay="2s" className="pointer-events-none absolute right-2.5 bottom-[330px]" />
            <AuthDiamond size={20} delay="4s" className="pointer-events-none absolute right-[34px] bottom-[150px]" />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                <Link href="/dashboard" className="offacto-sidebar-brand" onClick={onNavigate}>
                    <img src={AUTH_MARK_SRC} alt="" width={30} height={30} />
                    Offacto
                </Link>

                <CompanySwitcher variant="offacto" onNavigate={onNavigate} planLabel={planLabel} />

                <SidebarCreateMenu disabled={!viewingCompany} />

                <div ref={sidebarNavRef} className="admin-sidebar-nav min-h-0 flex-1 overflow-y-auto pb-2">
                    {groups.map((group) => (
                        <div key={group.labelKey}>
                            <div className="offacto-navlbl">{t(group.labelKey)}</div>
                            <nav className="offacto-nav flex flex-col gap-[2px]">
                                {group.items.map((item) => (
                                    <SidebarNavLink
                                        key={item.href}
                                        item={item}
                                        activeHref={activeHref}
                                        label={t(item.label)}
                                        variant="offacto"
                                        onNavigate={onNavigate}
                                        count={
                                            item.countKey != null ? sidebarCounts[item.countKey] : undefined
                                        }
                                        badge={item.badgeKey ? t(item.badgeKey) : item.badge}
                                        showTimerDot={item.href === '/time' && timerRunning && !onTimePage}
                                    />
                                ))}
                            </nav>
                        </div>
                    ))}
                </div>

                {trial && !isAdmin && (
                    <div className="offacto-side-foot shrink-0">
                        <b>{t('sidebar.trial')}</b>
                        {t('sidebar.trial_days_left', { left: trial.left, total: trial.total })}
                        <div className="offacto-trial-bar">
                            <i style={{ width: `${trial.percent}%` }} />
                        </div>
                        <Link href={COMPANY_PLAN_SETTINGS_PATH} onClick={onNavigate}>
                            {t('sidebar.choose_plan')} →
                        </Link>
                    </div>
                )}

                <Link href="/logout" method="post" as="button" className="offacto-sidebar-logout shrink-0" onClick={onNavigate}>
                    <Icon name="logout" className="h-[18px] w-[18px]" />
                    {t('sidebar.log_out')}
                </Link>
            </div>
        </aside>
    );
}
