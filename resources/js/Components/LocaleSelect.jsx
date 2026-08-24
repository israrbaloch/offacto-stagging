import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';
import Icon from './Icon';

const LOCALES = [
    { value: 'en', short: 'EN', label: 'locale.en' },
    { value: 'fr', short: 'FR', label: 'locale.fr' },
    { value: 'nl', short: 'NL', label: 'locale.nl' },
];

export default function LocaleSelect({ className = '' }) {
    const { locale } = usePage().props;
    const current = LOCALES.find((item) => item.value === locale) || LOCALES[0];
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

    const choose = (value) => {
        setOpen(false);
        if (value === (locale || 'en')) return;
        router.post('/locale', { locale: value }, { preserveScroll: true, preserveState: false });
    };

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <button
                type="button"
                aria-label={t('locale.label')}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
                {current.short}
                <Icon name="chevron" className={`h-3.5 w-3.5 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl">
                    <div className="px-3 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {t('locale.label')}
                    </div>
                    {LOCALES.map((item) => {
                        const active = item.value === current.value;
                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => choose(item.value)}
                                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                                    active
                                        ? 'bg-indigo-50 font-medium text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <span>{t(item.label)}</span>
                                <span className={`text-xs ${active ? 'text-indigo-500' : 'text-slate-400'}`}>{item.short}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
