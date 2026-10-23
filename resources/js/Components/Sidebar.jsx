import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef } from 'react';
import { AuthDiamond } from '../Layouts/AuthSplitLayout';
import { t } from '../lib/i18n';
import CompanySwitcher from './CompanySwitcher';
import Icon from './Icon';
import SidebarCreateMenu from './SidebarCreateMenu';
import SidebarNavLink, { resolveSidebarActiveHref } from './SidebarNavLink';

const AUTH_MARK_SRC = '/assets/images/favicon.ico';

function buildNavGroups({ isAdmin, viewingCompany }) {
    const overview = [{ href: '/dashboard', label: 'nav.dashboard', icon: 'grid', exact: true }];

    const sales = viewingCompany
        ? [
              { href: '/briefings', label: 'nav.briefings', icon: 'clipboard' },
              { href: '/offers', label: 'nav.quotes', icon: 'offers' },
              { href: '/invoices', label: 'nav.invoices', icon: 'invoice' },
              { href: '/customers', label: 'nav.customers', icon: 'customers' },
          ]
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
        ...(isAdmin ? [{ href: '/companies', label: 'nav.companies', icon: 'building' }] : []),
        ...(isAdmin ? [{ href: '/admin/dashboard', label: 'nav.offacto_admin', icon: 'shield' }] : []),
        { href: '/support', label: 'nav.brief_check', icon: 'road' },
    ];

    return [
        { labelKey: 'nav.overview', items: overview },
        ...(sales.length ? [{ labelKey: 'nav.sales', items: sales }] : []),
        ...(work.length ? [{ labelKey: 'nav.work', items: work }] : []),
        { labelKey: 'nav.manage', items: manage },
    ];
}

function trialFoot(activeCompany) {
    if (!activeCompany || activeCompany.subscription_plan || activeCompany.trial_expired) {
        return null;
    }
    const left = activeCompany.trial_days_left ?? 0;
    let percent = 36;
    const start = activeCompany.trial_starts_at ? new Date(activeCompany.trial_starts_at).getTime() : null;
    const end = activeCompany.trial_ends_at ? new Date(activeCompany.trial_ends_at).getTime() : null;
    if (start && end && end > start) {
        percent = Math.min(100, Math.max(4, ((Date.now() - start) / (end - start)) * 100));
    }
    const totalDays = start && end ? Math.max(1, Math.round((end - start) / 86400000)) : 14;
    const used = Math.max(0, totalDays - left);

    return { percent, used, total: totalDays, left };
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
        if (activeCompany.subscription_plan) {
            return t(`upgrade.plans.${activeCompany.subscription_plan}.name`);
        }
        if (!activeCompany.trial_expired) {
            return t('sidebar.trial');
        }
        return null;
    })();

    return (
        <aside
            className="offacto-sidebar sticky top-0 z-auto hidden h-screen w-[256px] shrink-0 flex-col overflow-hidden md:flex"
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
                                    />
                                ))}
                            </nav>
                        </div>
                    ))}
                </div>

                {trial && !isAdmin && (
                    <div className="offacto-side-foot shrink-0">
                        <b>{t('sidebar.trial')}</b>
                        {t('sidebar.trial_days_left', { used: trial.used, total: trial.total })}
                        <div className="offacto-trial-bar">
                            <i style={{ width: `${trial.percent}%` }} />
                        </div>
                        <Link href="/upgrade" onClick={onNavigate}>
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
