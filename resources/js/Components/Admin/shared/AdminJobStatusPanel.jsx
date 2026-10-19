import { AdminBadge, AdminButton, AdminTextButton, badgeToneFor } from '../ui';

/** SH-019 — async job progress / retry UI. */
export default function AdminJobStatusPanel({ job }) {
    if (!job) return null;

    const tone = badgeToneFor(job.status);

    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="font-mono text-xs text-slate-400">{job.reference || job.id}</p>
                    <p className="text-sm font-medium text-slate-900">{job.label || job.type}</p>
                </div>
                <AdminBadge tone={tone}>{job.status}</AdminBadge>
            </div>
            {job.status === 'running' && job.progress != null && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-slate-900 transition-all" style={{ width: `${Math.min(100, job.progress)}%` }} />
                </div>
            )}
            {job.message && <p className="mt-2 text-xs text-slate-500">{job.message}</p>}
            <div className="mt-3 flex gap-2">
                {job.status === 'failed' && job.onRetry && (
                    <AdminButton type="button" variant="secondary" onClick={job.onRetry}>
                        Retry
                    </AdminButton>
                )}
                {job.onDismiss && (
                    <AdminTextButton type="button" onClick={job.onDismiss}>
                        Dismiss
                    </AdminTextButton>
                )}
            </div>
        </div>
    );
}
