/**
 * Persistent in-page notice (not a toast). Use for ongoing states, not one-off confirmations.
 */
export default function PageNotice({ variant = 'info', children, className = '' }) {
    const styles = {
        info: 'border-indigo-100 bg-indigo-50 text-indigo-800',
        success: 'border-emerald-100 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-100 bg-amber-50 text-amber-900',
        error: 'border-rose-100 bg-rose-50 text-rose-800',
    };

    return (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[variant] || styles.info} ${className}`}>
            {children}
        </div>
    );
}
