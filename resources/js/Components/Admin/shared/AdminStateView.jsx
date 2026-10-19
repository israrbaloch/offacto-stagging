import { AdminButton } from '../ui';

/** SH-013 — empty, loading, and error states. */
export function AdminLoadingState({ message = 'Loading…' }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white px-6 py-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" aria-hidden />
            <p className="mt-4 text-sm text-slate-500">{message}</p>
        </div>
    );
}

export function AdminErrorState({ title = 'Something went wrong', message, onRetry }) {
    return (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-rose-900">{title}</p>
            {message && <p className="mt-2 text-sm text-rose-800/90">{message}</p>}
            {onRetry && (
                <AdminButton type="button" variant="secondary" className="mt-4" onClick={onRetry}>
                    Try again
                </AdminButton>
            )}
        </div>
    );
}

export function AdminEmptyState({ message = 'Nothing here yet.', action }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center text-sm text-slate-400">
            <p>{message}</p>
            {action}
        </div>
    );
}
