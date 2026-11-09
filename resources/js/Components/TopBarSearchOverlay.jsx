import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import Icon from './Icon';
import { t } from '../lib/i18n';

export default function TopBarSearchOverlay({ open, query, hits, onQueryChange, onClose }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) {
            document.body.style.removeProperty('overflow');
            return undefined;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const frame = requestAnimationFrame(() => inputRef.current?.focus());
        return () => {
            cancelAnimationFrame(frame);
            document.body.style.overflow = prev;
        };
    }, [open]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const onKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    const submit = (event) => {
        event.preventDefault();
        const q = query.trim();
        if (!q) {
            return;
        }
        onClose();
        const first = hits?.invoices?.[0] || hits?.offers?.[0] || hits?.customers?.[0];
        if (first?.href) {
            router.visit(first.href);
            return;
        }
        router.get('/search', { q });
    };

    return (
        <div className="offacto-search-layer" role="presentation">
            <button type="button" className="offacto-search-layer-scrim" aria-label={t('common.close')} onClick={onClose} />
            <div className="offacto-search-layer-panel" role="dialog" aria-modal="true" aria-label={t('topbar.search')}>
                <form className="offacto-search-layer-form" onSubmit={submit}>
                    <span className="offacto-search-layer-icon" aria-hidden="true">
                        <Icon name="search" />
                    </span>
                    <input
                        ref={inputRef}
                        type="search"
                        enterKeyHint="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder={t('topbar.search')}
                        aria-label={t('topbar.search')}
                    />
                    <button type="button" className="offacto-search-layer-close" aria-label={t('common.close')} onClick={onClose}>
                        <Icon name="x" />
                    </button>
                </form>
                {hits ? (
                    <SearchHits
                        hits={hits}
                        onPick={(href) => {
                            onClose();
                            router.visit(href);
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
}

export function SearchHits({ hits, onPick }) {
    const groups = [
        ['invoices', t('nav.invoices'), hits.invoices],
        ['offers', t('nav.offers'), hits.offers],
        ['customers', t('nav.customers'), hits.customers],
    ].filter(([, , rows]) => rows?.length);

    if (!groups.length) {
        return (
            <div className="offacto-search-hits">
                <p className="px-3 py-2 text-sm text-slate-500">{t('topbar.search_empty')}</p>
            </div>
        );
    }

    return (
        <div className="offacto-search-hits" role="listbox">
            {groups.map(([key, label, rows]) => (
                <div key={key}>
                    <p className="offacto-search-hit-label">{label}</p>
                    {rows.map((row) => (
                        <button
                            type="button"
                            key={`${row.href}-${row.label}`}
                            className="offacto-search-hit"
                            onClick={() => onPick(row.href)}
                        >
                            <span>{row.label}</span>
                            {row.meta ? <span className="offacto-search-hit-meta">{row.meta}</span> : null}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}
