import { Link } from '@inertiajs/react';

/** SH-015 — breadcrumb trail under page header. */
export default function AdminBreadcrumbs({ items = [] }) {
    if (!items.length) return null;

    return (
        <nav aria-label="Breadcrumb" className="mb-1 flex flex-wrap items-center gap-1 text-xs text-slate-500">
            {items.map((item, i) => {
                const last = i === items.length - 1;
                return (
                    <span key={item.href || item.label} className="flex items-center gap-1">
                        {i > 0 && <span className="text-slate-300">/</span>}
                        {last || !item.href ? (
                            <span className={last ? 'font-medium text-slate-700' : ''}>{item.label}</span>
                        ) : (
                            <Link href={item.href} className="hover:text-slate-800">
                                {item.label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
