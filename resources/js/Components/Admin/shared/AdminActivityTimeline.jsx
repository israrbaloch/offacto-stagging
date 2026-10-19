import { AdminBadge, AdminTimeline, badgeToneFor } from '../ui';

/** SH-006 — resource activity timeline (wraps AdminTimeline with audit-friendly defaults). */
export default function AdminActivityTimeline({ events = [], formatDate, emptyMessage = 'No activity recorded yet.' }) {
    if (!events.length) {
        return <p className="text-sm text-slate-400">{emptyMessage}</p>;
    }

    const normalized = events.map((ev, i) => ({
        id: ev.id ?? i,
        at: ev.at ?? ev.created_at,
        type: ev.type ?? ev.action ?? 'event',
        label: ev.label ?? ev.outcome ?? ev.action ?? 'Event',
        detail: ev.detail ?? ev.actor ?? ev.user?.name,
        tone: ev.tone ?? badgeToneFor(ev.label ?? ev.action),
        raw: ev,
    }));

    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <AdminTimeline
                events={normalized.map(({ id, at, type, label, detail }) => ({ id, at, type, label, detail }))}
                formatDate={formatDate}
            />
        </div>
    );
}

export function AdminTimelineEventBadge({ tone, children }) {
    return <AdminBadge tone={tone}>{children}</AdminBadge>;
}
