import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../lib/i18n';
import Icon from './Icon';

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('') || '—';
}

function CompanyAvatar({ company, active = false, compact = false }) {
    const sizeClass = compact ? 'h-10 w-10 rounded-xl text-[10px]' : 'h-8 w-8 rounded-xl text-[11px]';

    if (company?.logo_url) {
        return (
            <span
                className={`flex shrink-0 items-center justify-center overflow-hidden bg-white ${sizeClass} ${active ? 'ring-2 ring-indigo-200' : ''}`}
            >
                <img src={company.logo_url} alt="" className="h-full w-full object-contain p-0.5" />
            </span>
        );
    }

    return (
        <span
            className={`flex shrink-0 items-center justify-center font-semibold ${sizeClass} ${
                active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}
        >
            {initials(company?.company_name)}
        </span>
    );
}

export default function CompanySwitcher({ collapsed = false, variant = 'light', onNavigate, planLabel }) {
    const { companies, activeCompany, auth } = usePage().props;
    const isAdmin = Boolean(auth?.user?.is_admin);
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const update = () => {
            const el = buttonRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            if (collapsed) {
                setMenuStyle({
                    top: rect.top,
                    left: rect.right + 8,
                    width: 260,
                });
            } else {
                setMenuStyle({
                    top: rect.bottom + 6,
                    left: rect.left,
                    width: Math.max(rect.width, 220),
                });
            }
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [open, collapsed]);

    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (event) => {
            if (buttonRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) {
                return;
            }
            setOpen(false);
        };
        const onKey = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    if (!companies?.length && !isAdmin) return null;

    const current = activeCompany ? companies?.find((company) => company.id === activeCompany.id) : null;
    const currentLabel =
        current?.company_name || (isAdmin ? t('platform.no_company_selected') : t('company.switcher.select'));

    const menu =
        open && menuStyle
            ? createPortal(
                  <>
                      <button
                          type="button"
                          aria-label={t('common.cancel')}
                          className="fixed inset-0 z-[90] cursor-default bg-slate-900/20"
                          onClick={() => setOpen(false)}
                      />
                      <div
                          ref={menuRef}
                          className="fixed z-[100] max-h-[min(20rem,calc(100vh-6rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-2xl"
                          style={{
                              top: menuStyle.top,
                              left: menuStyle.left,
                              width: menuStyle.width,
                          }}
                      >
                          {(companies || []).map((company) => {
                              const active = company.id === current?.id;
                              return (
                                  <button
                                      key={company.id}
                                      type="button"
                                      onClick={() => {
                                          setOpen(false);
                                          if (company.id !== current?.id) {
                                              router.post(`/company/switch/${company.id}`);
                                          }
                                      }}
                                      className={`flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left ${
                                          active ? 'bg-indigo-50' : 'hover:bg-slate-50'
                                      }`}
                                  >
                                      <CompanyAvatar company={company} active={active} />
                                      <span className="min-w-0 flex-1">
                                          <span
                                              className={`block truncate text-sm ${active ? 'font-semibold text-indigo-700' : 'font-medium text-slate-700'}`}
                                          >
                                              {company.company_name}
                                          </span>
                                      </span>
                                      {active && <Icon name="check" className="h-4 w-4 shrink-0 text-indigo-600" />}
                                  </button>
                              );
                          })}
                          {!isAdmin && (
                              <div className="border-t border-slate-100 px-2.5 py-2">
                                  <Link
                                      href="/companies/create"
                                      onClick={() => setOpen(false)}
                                      className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                  >
                                      <Icon name="plus" className="h-3.5 w-3.5" />
                                      {t('company.switcher.add')}
                                  </Link>
                              </div>
                          )}
                          {isAdmin && activeCompany && (
                              <div className="border-t border-slate-100 px-2.5 py-2">
                                  <button
                                      type="button"
                                      className="flex w-full items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                                      onClick={() => {
                                          setOpen(false);
                                          router.post('/company/clear-workspace');
                                      }}
                                  >
                                      {t('platform.clear_workspace')}
                                  </button>
                              </div>
                          )}
                      </div>
                  </>,
                  document.body,
              )
            : null;

    const workspaceMeta =
        isAdmin && !current
            ? t('platform.admin_mode')
            : current?.is_active === false
              ? t('common.inactive')
              : planLabel || t('common.workspace');

    if (variant === 'offacto') {
        return (
            <>
                <button
                    ref={buttonRef}
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    onClick={() => setOpen((value) => !value)}
                    className="offacto-sidebar-ws"
                >
                    <span className="ws-av">{initials(current?.company_name || currentLabel)}</span>
                    <span className="min-w-0 flex-1">
                        <b className="truncate">{currentLabel}</b>
                        <small>
                            {t('common.workspace')}
                            {planLabel ? ` · ${planLabel}` : ''}
                        </small>
                    </span>
                    <Icon name="chevron" className={`ws-chev transition ${open ? 'rotate-180' : ''}`} />
                </button>
                {menu}
            </>
        );
    }

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-haspopup="listbox"
                title={collapsed ? currentLabel : undefined}
                onClick={() => setOpen((value) => !value)}
                className={`flex w-full items-center rounded-2xl border border-indigo-100/80 bg-white shadow-sm shadow-indigo-100/40 transition hover:border-indigo-200 hover:shadow ${
                    collapsed ? 'aspect-square justify-center p-0' : 'gap-2.5 px-2.5 py-2 text-left'
                }`}
            >
                <CompanyAvatar company={current} active compact={collapsed} />
                {!collapsed && (
                    <>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-800">{currentLabel}</span>
                            <span className="block text-[11px] text-slate-400">{workspaceMeta}</span>
                        </span>
                        <Icon name="chevron" className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>
            {menu}
        </>
    );
}
