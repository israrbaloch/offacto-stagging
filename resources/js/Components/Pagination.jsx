import { Link } from '@inertiajs/react';

export default function Pagination({ links = [] }) {
    if (!links.length) return null;

    return (
        <div className="mt-4 flex flex-wrap gap-1">
            {links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || '#'}
                    preserveScroll
                    className={`rounded-md px-3 py-1 text-sm ${
                        link.active
                            ? 'bg-[var(--company-primary)] text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                    } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
