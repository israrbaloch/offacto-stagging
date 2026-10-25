import { useEffect, useRef } from 'react';
import Icon from '../../Icon';
import { t } from '../../../lib/i18n';

export default function AdminSearchOverlay({
    open,
    query,
    onQueryChange,
    onClose,
    results = [],
    loading = false,
    onSelectResult,
    minLength = 2,
}) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const frame = requestAnimationFrame(() => inputRef.current?.focus());
        return () => cancelAnimationFrame(frame);
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

    const trimmed = query.trim();
    const showResults = trimmed.length >= minLength;

    return (
        <div className="offacto-admin-search-layer" role="presentation">
            <button type="button" className="offacto-admin-search-layer-scrim" aria-label={t('common.close')} onClick={onClose} />
            <div className="offacto-admin-search-layer-panel" role="dialog" aria-modal="true" aria-label="Admin search">
                <form
                    className="offacto-admin-search-layer-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                    }}
                >
                    <Icon name="search" />
                    <input
                        ref={inputRef}
                        type="search"
                        enterKeyHint="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Search companies, accounts, or plan payments"
                        aria-label="Admin search"
                    />
                    <button type="button" className="offacto-admin-search-layer-close" aria-label={t('common.close')} onClick={onClose}>
                        <Icon name="x" />
                    </button>
                </form>
            </div>
            <div className="offacto-admin-search-layer-body">
                {!showResults && <p className="offacto-admin-search-layer-hint">Type at least {minLength} characters to search.</p>}
                {showResults && loading && <p className="offacto-admin-search-layer-hint">Searching…</p>}
                {showResults && !loading && results.length === 0 && (
                    <p className="offacto-admin-search-layer-hint">No results</p>
                )}
                {showResults && !loading && results.length > 0 && (
                    <ul>
                        {results.map((row, index) => (
                            <li key={`${row.type}-${index}`}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectResult(row);
                                        onClose();
                                    }}
                                >
                                    <span className="label">{row.label}</span>
                                    <span className="meta">
                                        {row.type} · {row.meta}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
