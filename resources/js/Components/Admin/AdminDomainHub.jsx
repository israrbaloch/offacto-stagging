import { Link } from '@inertiajs/react';
import { AdminCard } from './ui';

/**
 * Shared hub layout for domain index pages (metrics + grouped link cards).
 */
export default function AdminDomainHub({ metricsSlot = null, banner = null, groups = [], resolveHref }) {
    return (
        <div className="space-y-8">
            {metricsSlot}
            {banner}
            {groups.map((group) => (
                <section key={group.group}>
                    <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.group}</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {group.items.map((item) => {
                            const href = resolveHref(item);
                            const cta =
                                item.kind === 'operation'
                                    ? item.operationCta || 'Open report →'
                                    : item.configCta || 'Configure →';
                            return (
                                <Link key={item.id} href={href} className="group block">
                                    <AdminCard className="h-full transition group-hover:ring-1 group-hover:ring-slate-900/10">
                                        <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
                                        <span className="mt-4 inline-block text-xs font-medium text-slate-600 group-hover:text-slate-900">{cta}</span>
                                    </AdminCard>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
