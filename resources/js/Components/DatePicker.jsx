import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function parseISO(value) {
    if (!value) return null;
    const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

function toISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDisplay(value) {
    const date = parseISO(value);
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function monthGrid(year, month) {
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i += 1) {
        cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) {
        cells.push(null);
    }
    return cells;
}

export default function DatePicker({
    value = '',
    onChange,
    placeholder = 'Select date',
    className = '',
    error,
    allowClear = true,
}) {
    const selected = parseISO(value);
    const [open, setOpen] = useState(false);
    const [cursor, setCursor] = useState(() => selected || new Date());
    const rootRef = useRef(null);

    useEffect(() => {
        if (open) {
            setCursor(selected || new Date());
        }
    }, [open, value]);

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

    const cells = useMemo(() => monthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
    const today = new Date();
    const label = formatDisplay(value);

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
                <Icon name="calendar" className="h-4 w-4 shrink-0 text-indigo-500" />
                <span className={`flex-1 truncate ${label ? 'text-slate-900' : 'text-slate-400'}`}>{label || placeholder}</span>
                <Icon name="chevron" className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-40 mt-2 w-[288px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-50"
                            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                            aria-label="Previous month"
                        >
                            <Icon name="chevronLeft" className="h-4 w-4" />
                        </button>
                        <div className="text-sm font-semibold text-slate-900">
                            {cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </div>
                        <button
                            type="button"
                            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-50"
                            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                            aria-label="Next month"
                        >
                            <Icon name="chevronRight" className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="py-1">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {cells.map((date, index) => {
                            if (!date) {
                                return <div key={`empty-${index}`} className="h-9" />;
                            }
                            const isSelected = sameDay(date, selected);
                            const isToday = sameDay(date, today);
                            return (
                                <button
                                    key={toISO(date)}
                                    type="button"
                                    onClick={() => emit(toISO(date))}
                                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                                        isSelected
                                            ? 'bg-indigo-600 font-semibold text-white'
                                            : isToday
                                                ? 'font-semibold text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50'
                                                : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                        <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-700" onClick={() => emit(toISO(new Date()))}>
                            Today
                        </button>
                        {allowClear && (
                            <button type="button" className="text-xs text-slate-400 hover:text-slate-600" onClick={() => emit('')}>
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
