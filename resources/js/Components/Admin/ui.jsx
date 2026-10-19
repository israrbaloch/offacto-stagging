import { Link } from '@inertiajs/react';

export const inputClass =
    'w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/5';

export const selectClass =
    'w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/5';

export const checkboxClass =
    'h-4 w-4 rounded border-slate-300 text-slate-900 shadow-sm focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-0';

export const labelClass = 'mb-1.5 block text-xs font-medium text-slate-600';

/** In-card section (commercial terms, capabilities, etc.) */
export function AdminSection({ title, description, children, className = '' }) {
    return (
        <div className={`${className}`}>
            {title && (
                <div className="mb-4">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
                    {description && <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>}
                </div>
            )}
            {children}
        </div>
    );
}

export function AdminField({ label, hint, children, className = '' }) {
    return (
        <label className={`block text-sm ${className}`}>
            {label && <span className={labelClass}>{label}</span>}
            {children}
            {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        </label>
    );
}

export function AdminFormGrid({ children, cols = 2, className = '' }) {
    const colClass = cols === 4 ? 'lg:grid-cols-4' : cols === 3 ? 'lg:grid-cols-3' : 'sm:grid-cols-2';
    return <div className={`grid gap-4 ${colClass} ${className}`}>{children}</div>;
}

export function AdminCheckboxField({ label, checked, onChange, hint }) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-3 text-sm transition hover:bg-slate-50">
            <input type="checkbox" className={`${checkboxClass} mt-0.5`} checked={checked} onChange={onChange} />
            <span>
                <span className="font-medium text-slate-800">{label}</span>
                {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
            </span>
        </label>
    );
}

export function AdminFormActions({ children, className = '' }) {
    return (
        <div className={`flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4 ${className}`}>{children}</div>
    );
}

export function AdminMetric({ label, value, hint, accent = false }) {
    return (
        <section
            className={`rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${accent ? 'border-rose-200/80' : 'border-slate-200/70'}`}
        >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className={`mt-2 text-2xl font-semibold tracking-tight ${accent ? 'text-rose-600' : 'text-slate-900'}`}>{value}</p>
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </section>
    );
}

export function AdminTextButton({ children, className = '', ...props }) {
    return (
        <button
            type="button"
            className={`text-sm font-medium text-slate-500 transition hover:text-slate-900 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function AdminDl({ children }) {
    return <dl className="space-y-3 text-sm">{children}</dl>;
}

export function AdminDlRow({ term, children }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
            <dt className="text-slate-500">{term}</dt>
            <dd className="text-right font-medium text-slate-900">{children}</dd>
        </div>
    );
}

export function AdminListPanel({ children, emptyMessage }) {
    if (!children?.length && emptyMessage) {
        return <AdminEmpty message={emptyMessage} />;
    }
    return <ul className="divide-y divide-slate-100">{children}</ul>;
}

export function AdminListRow({ children, className = '' }) {
    return <li className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm ${className}`}>{children}</li>;
}

export function AdminPage({ children }) {
    return <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-50/90">{children}</div>;
}

export function AdminHeader({ eyebrow, title, description, backHref, backLabel = 'Back', actions }) {
    return (
        <header className="border-b border-slate-200/70 bg-white/80 px-4 py-5 backdrop-blur-sm lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    {backHref && (
                        <Link href={backHref} className="text-sm font-medium text-slate-500 transition hover:text-slate-800">
                            ← {backLabel}
                        </Link>
                    )}
                    {eyebrow && (
                        <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 ${backHref ? 'mt-3' : ''}`}>
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
                    {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
        </header>
    );
}

export function AdminBody({ children, className = '' }) {
    return <div className={`mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8 lg:py-8 ${className}`}>{children}</div>;
}

export function AdminCard({ title, description, children, className = '', padding = true }) {
    return (
        <section
            className={`rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
        >
            {(title || description) && (
                <div className="border-b border-slate-100 px-5 py-4">
                    {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
                    {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
                </div>
            )}
            <div className={padding ? 'px-5 py-4' : ''}>{children}</div>
        </section>
    );
}

const badgeTones = {
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-600/10',
    warning: 'bg-amber-50 text-amber-900 ring-amber-600/10',
    danger: 'bg-rose-50 text-rose-800 ring-rose-600/10',
    neutral: 'bg-slate-100 text-slate-700 ring-slate-600/10',
    info: 'bg-indigo-50 text-indigo-800 ring-indigo-600/10',
};

export function AdminBadge({ children, tone = 'neutral' }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeTones[tone] || badgeTones.neutral}`}>
            {children}
        </span>
    );
}

export function badgeToneFor(label = '') {
    const key = String(label).toLowerCase();
    if (['paid', 'active', 'approved', 'verified', 'success'].some((k) => key.includes(k))) return 'success';
    if (['pending', 'draft', 'partial'].some((k) => key.includes(k))) return 'warning';
    if (['failed', 'reject', 'suspended', 'inactive', 'expired', 'cancel'].some((k) => key.includes(k))) return 'danger';
    return 'neutral';
}

const btnVariants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
    secondary: 'border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
    accent: 'bg-indigo-600 text-white hover:bg-indigo-700',
};

export function AdminButton({ variant = 'primary', className = '', type = 'button', ...props }) {
    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${btnVariants[variant] || btnVariants.primary} ${className}`}
            {...props}
        />
    );
}

export function AdminLinkButton({ href, variant = 'secondary', children, className = '' }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${btnVariants[variant] || btnVariants.secondary} ${className}`}
        >
            {children}
        </Link>
    );
}

export function AdminTable({ columns, children, empty }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80">
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">{children}</tbody>
                </table>
            </div>
            {empty}
        </div>
    );
}

export function AdminTabs({ tabs, active, onChange }) {
    return (
        <nav className="flex flex-wrap gap-1 border-b border-slate-200/70 bg-white/60 px-4 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-wrap gap-1 py-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                            active === tab.id
                                ? 'bg-slate-900 font-medium text-white shadow-sm'
                                : 'text-slate-600 hover:bg-white hover:text-slate-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}

export function AdminTimeline({ events = [], formatDate }) {
    if (!events.length) {
        return <p className="text-sm text-slate-400">No events yet.</p>;
    }

    return (
        <ul className="divide-y divide-slate-100">
            {events.map((ev) => (
                <li
                    key={ev.id}
                    className="grid grid-cols-1 gap-2 py-3.5 sm:grid-cols-[7.5rem_7rem_minmax(0,1fr)_minmax(0,8rem)] sm:items-center sm:gap-4"
                >
                    <span className="text-xs tabular-nums text-slate-500">{formatDate(ev.at)}</span>
                    <span className="truncate font-mono text-[11px] uppercase tracking-wide text-slate-400">{ev.type}</span>
                    <div className="min-w-0">
                        <AdminBadge tone={badgeToneFor(ev.label)}>{ev.label}</AdminBadge>
                    </div>
                    <span className="truncate text-right text-sm text-slate-600 sm:text-left">{ev.detail || '—'}</span>
                </li>
            ))}
        </ul>
    );
}

export function AdminEmpty({ message = 'Nothing here yet.' }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center text-sm text-slate-400">
            {message}
        </div>
    );
}

export function AdminFilterBar({ children, onSubmit }) {
    return (
        <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:p-5"
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
        </form>
    );
}
