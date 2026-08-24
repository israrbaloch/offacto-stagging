import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';

export default function SelectMenu({
    value = '',
    onChange,
    options = [],
    placeholder = 'Select',
    className = '',
    error,
    searchable,
    allowEmpty = true,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const rootRef = useRef(null);
    const searchRef = useRef(null);
    const enableSearch = searchable ?? options.length > 8;

    const selected = options.find((option) => String(option.value) === String(value));
    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return options;
        return options.filter((option) => String(option.label).toLowerCase().includes(term));
    }, [options, query]);

    useEffect(() => {
        if (!open) {
            setQuery('');
            return undefined;
        }
        const timer = setTimeout(() => searchRef.current?.focus(), 0);
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
            clearTimeout(timer);
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const emit = (next) => {
        onChange?.({ target: { value: next } });
        setOpen(false);
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`flex w-full items-center gap-2 text-left ${className} ${error ? 'border-rose-400' : ''}`}
            >
                <span className={`flex-1 truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
                    {selected?.label || placeholder}
                </span>
                <Icon name="chevron" className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-40 mt-2 w-full min-w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    {enableSearch && (
                        <div className="border-b border-slate-100 p-2">
                            <input
                                ref={searchRef}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                placeholder="Search…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="max-h-60 overflow-auto p-1">
                        {allowEmpty && (
                            <button
                                type="button"
                                onClick={() => emit('')}
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-50"
                            >
                                {placeholder}
                            </button>
                        )}
                        {filtered.length === 0 && <div className="px-3 py-4 text-center text-xs text-slate-400">No matches</div>}
                        {filtered.map((option) => {
                            const active = String(option.value) === String(value);
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => emit(option.value)}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                                        active ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {active && <Icon name="check" className="h-4 w-4 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
