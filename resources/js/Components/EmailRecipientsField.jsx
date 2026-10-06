import { useRef, useState } from 'react';
import { t } from '../lib/i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeToken(raw) {
    return raw.trim().replace(/[,;]+$/, '');
}

export default function EmailRecipientsField({ label, value = [], onChange, error, placeholder }) {
    const [draft, setDraft] = useState('');
    const [localError, setLocalError] = useState('');
    const inputRef = useRef(null);

    const emails = Array.isArray(value) ? value : [];

    const focusInput = () => inputRef.current?.focus();

    const addEmail = (raw) => {
        const token = normalizeToken(raw);
        if (!token) return true;

        if (!EMAIL_RE.test(token)) {
            setLocalError(t('offers.send_emails_invalid'));
            return false;
        }

        const lower = token.toLowerCase();
        if (emails.some((e) => e.toLowerCase() === lower)) {
            setDraft('');
            setLocalError('');
            return true;
        }

        onChange([...emails, token]);
        setDraft('');
        setLocalError('');
        return true;
    };

    const removeAt = (index) => {
        onChange(emails.filter((_, i) => i !== index));
        setLocalError('');
    };

    const onKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ',' || event.key === ';' || event.key === 'Tab') {
            if (draft.trim()) {
                event.preventDefault();
                addEmail(draft);
            } else if (event.key === 'Tab') {
                // allow tab out when empty
            }
        } else if (event.key === 'Backspace' && !draft && emails.length > 0) {
            removeAt(emails.length - 1);
        }
    };

    const onPaste = (event) => {
        const text = event.clipboardData.getData('text');
        if (!text.includes(',') && !text.includes(';') && !text.includes('\n')) {
            return;
        }
        event.preventDefault();
        const parts = text.split(/[,;\n\s]+/).map(normalizeToken).filter(Boolean);
        const next = [...emails];
        for (const part of parts) {
            if (!EMAIL_RE.test(part)) {
                setLocalError(t('offers.send_emails_invalid'));
                continue;
            }
            const lower = part.toLowerCase();
            if (!next.some((e) => e.toLowerCase() === lower)) {
                next.push(part);
            }
        }
        onChange(next);
        setDraft('');
    };

    const onBlur = () => {
        if (draft.trim()) {
            addEmail(draft);
        }
    };

    const displayError = error || localError;

    return (
        <div className="block">
            {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
            <div
                role="group"
                aria-label={label}
                onClick={focusInput}
                className={`flex min-h-[2.75rem] flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 text-sm outline-none focus-within:ring-2 focus-within:ring-[var(--company-primary)] ${
                    displayError ? 'border-rose-400' : 'border-slate-200'
                }`}
            >
                {emails.map((email, index) => (
                    <span
                        key={`${email}-${index}`}
                        className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 py-0.5 pl-2.5 pr-1 text-slate-800"
                    >
                        <span className="truncate">{email}</span>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                removeAt(index);
                            }}
                            className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                            aria-label={t('common.delete')}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    value={draft}
                    placeholder={emails.length === 0 ? placeholder || t('offers.send_emails_placeholder') : ''}
                    onChange={(e) => {
                        setDraft(e.target.value);
                        setLocalError('');
                    }}
                    onKeyDown={onKeyDown}
                    onBlur={onBlur}
                    onPaste={onPaste}
                    className="min-w-[8rem] flex-1 border-0 bg-transparent py-1 outline-none placeholder:text-slate-400"
                />
            </div>
            {displayError && <span className="mt-1 block text-xs text-rose-600">{displayError}</span>}
        </div>
    );
}
