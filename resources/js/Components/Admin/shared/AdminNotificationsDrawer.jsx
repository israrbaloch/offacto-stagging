import { Link } from '@inertiajs/react';
import { AdminBadge, AdminTextButton } from '../ui';

/** SH-005 — alerts, approvals, job failures. */
export default function AdminNotificationsDrawer({ open, onClose, items = [] }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[115] flex justify-end">
            <button type="button" className="absolute inset-0 bg-slate-900/30" aria-label="Close notifications" onClick={onClose} />
            <aside className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
                    <AdminTextButton type="button" onClick={onClose}>
                        Close
                    </AdminTextButton>
                </div>
                <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
                    {items.length === 0 && <li className="px-5 py-8 text-center text-sm text-slate-400">You&apos;re all caught up.</li>}
                    {items.map((item) => (
                        <li key={item.id} className="px-5 py-4">
                            <AdminBadge tone={item.tone || 'neutral'}>{item.title}</AdminBadge>
                            <p className="mt-2 text-sm text-slate-600">{item.body}</p>
                            {item.href && (
                                <Link href={item.href} className="mt-2 inline-block text-sm font-medium text-slate-900 hover:underline" onClick={onClose}>
                                    View
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    );
}
