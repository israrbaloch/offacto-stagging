import { AdminField } from '../ui';

/** SH-014 — inline field errors and form-level banner. */
export function AdminFieldError({ message }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}

export function AdminRequiredMark() {
    return <span className="text-rose-500" aria-hidden> *</span>;
}

export function AdminValidatedField({ label, required, error, hint, children, className = '' }) {
    const fieldLabel = label ? (
        <>
            {label}
            {required && <AdminRequiredMark />}
        </>
    ) : null;

    return (
        <AdminField label={fieldLabel} hint={!error ? hint : undefined} className={className}>
            {children}
            <AdminFieldError message={error} />
        </AdminField>
    );
}

export function AdminFormErrorBanner({ errors }) {
    const list = errors && typeof errors === 'object' ? Object.values(errors).flat().filter(Boolean) : [];
    if (!list.length) return null;
    return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
            <p className="font-medium">Please fix the following:</p>
            <ul className="mt-1 list-disc pl-5">
                {list.map((msg, i) => (
                    <li key={i}>{msg}</li>
                ))}
            </ul>
        </div>
    );
}
