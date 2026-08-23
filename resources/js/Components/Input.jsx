export default function Input({ label, error, className = '', ...props }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
            <input
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--company-primary)] ${
                    error ? 'border-rose-400' : 'border-slate-200'
                }`}
                {...props}
            />
            {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
        </label>
    );
}

export function TextArea({ label, error, className = '', ...props }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
            <textarea
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--company-primary)] ${
                    error ? 'border-rose-400' : 'border-slate-200'
                }`}
                {...props}
            />
            {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
        </label>
    );
}

export function Select({ label, error, options = [], className = '', placeholder, ...props }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
            <select
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--company-primary)] ${
                    error ? 'border-rose-400' : 'border-slate-200'
                }`}
                {...props}
            >
                {placeholder !== undefined && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
        </label>
    );
}
