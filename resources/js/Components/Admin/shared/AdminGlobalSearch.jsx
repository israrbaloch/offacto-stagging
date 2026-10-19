import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { inputClass } from '../ui';

/** SH-004 — admin omnisearch typeahead. */
export default function AdminGlobalSearch() {
    const [q, setQ] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounce = useRef(null);

    const fetchResults = useCallback((query) => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        window.axios
            .get('/admin/search', { params: { q: query } })
            .then((res) => setResults(res.data.results || []))
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        clearTimeout(debounce.current);
        debounce.current = setTimeout(() => fetchResults(q.trim()), 280);
        return () => clearTimeout(debounce.current);
    }, [q, fetchResults]);

    return (
        <div className="relative min-w-0 flex-1 max-w-md">
            <input
                type="search"
                className={`${inputClass} py-2 text-sm`}
                placeholder="Search companies, users, invoices…"
                value={q}
                onChange={(e) => {
                    setQ(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                aria-expanded={open}
                aria-controls="admin-global-search-results"
            />
            {open && (q.length >= 2 || results.length > 0) && (
                <ul
                    id="admin-global-search-results"
                    className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                >
                    {loading && <li className="px-3 py-2 text-xs text-slate-400">Searching…</li>}
                    {!loading && results.length === 0 && q.length >= 2 && <li className="px-3 py-2 text-xs text-slate-400">No results</li>}
                    {results.map((row, i) => (
                        <li key={`${row.type}-${i}`}>
                            <button
                                type="button"
                                className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-slate-50"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    setOpen(false);
                                    router.visit(row.href);
                                }}
                            >
                                <span className="font-medium text-slate-900">{row.label}</span>
                                <span className="text-xs text-slate-500">
                                    {row.type} · {row.meta}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
