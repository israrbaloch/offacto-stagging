import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
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

export default function CompanySwitcher() {
    const { companies, activeCompany } = usePage().props;
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
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

    if (!companies?.length) return null;

    const current = companies.find((company) => company.id === activeCompany?.id) || companies[0];

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center gap-2.5 rounded-2xl border border-indigo-100/80 bg-white px-2.5 py-2 text-left shadow-sm shadow-indigo-100/40 transition hover:border-indigo-200 hover:shadow"
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-[11px] font-semibold text-white">
                    {initials(current?.company_name)}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{current?.company_name || t('company.switcher.select')}</span>
                    <span className="block text-[11px] text-slate-400">{current?.is_active === false ? t('common.inactive') : t('common.workspace')}</span>
                </span>
                <Icon name="chevron" className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
                    {companies.map((company) => {
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
                                className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-left ${
                                    active ? 'bg-indigo-50' : 'hover:bg-slate-50'
                                }`}
                            >
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold ${
                                    active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {initials(company.company_name)}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className={`block truncate text-sm ${active ? 'font-semibold text-indigo-700' : 'font-medium text-slate-700'}`}>
                                        {company.company_name}
                                    </span>
                                </span>
                                {active && <Icon name="check" className="h-4 w-4 shrink-0 text-indigo-600" />}
                            </button>
                        );
                    })}
                    <div className="mt-1 border-t border-slate-100 px-2.5 py-2">
                        <Link href="/companies/create" className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                            <Icon name="plus" className="h-3.5 w-3.5" />
                            {t('company.switcher.add')}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
