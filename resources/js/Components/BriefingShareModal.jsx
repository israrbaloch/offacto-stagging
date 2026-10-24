import { useEffect, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Icon from './Icon';
import { useUi } from '../context/UiContext';
import { t } from '../lib/i18n';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value) {
    return EMAIL_PATTERN.test(String(value || '').trim());
}

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

export default function BriefingShareModal({ open, onClose, briefingId, shareUrl }) {
    const { toast } = useUi();
    const inputRef = useRef(null);
    const [emails, setEmails] = useState([]);
    const [draft, setDraft] = useState('');
    const form = useForm({ message: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (open) {
            setEmails([]);
            setDraft('');
            form.reset();
            form.clearErrors();
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const addEmails = (candidates) => {
        setEmails((current) => {
            const next = [...current];
            candidates.forEach((raw) => {
                const email = normalizeEmail(raw);
                if (!email || !isValidEmail(email) || next.includes(email)) {
                    return;
                }
                next.push(email);
            });
            return next;
        });
    };

    const commitDraft = () => {
        const trimmed = draft.trim().replace(/[,;]+$/, '').trim();
        if (!trimmed) {
            setDraft('');
            return;
        }
        if (isValidEmail(trimmed)) {
            addEmails([trimmed]);
            setDraft('');
        }
    };

    const removeEmail = (email) => {
        setEmails((current) => current.filter((item) => item !== email));
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success(t('common.copied'), 2500);
        } catch {
            toast.warning(t('common.copy_failed'));
        }
    };

    const handleDraftKeyDown = (event) => {
        if (event.key === 'Tab' || event.key === ',' || event.key === 'Enter') {
            if (draft.trim()) {
                event.preventDefault();
                commitDraft();
            } else if (event.key === 'Enter') {
                event.preventDefault();
            }
            return;
        }
        if (event.key === 'Backspace' && !draft && emails.length > 0) {
            setEmails((current) => current.slice(0, -1));
        }
    };

    const handlePaste = (event) => {
        const text = event.clipboardData.getData('text');
        if (!text.includes(',') && !text.includes(';') && !text.includes('\n')) {
            return;
        }
        event.preventDefault();
        const parts = text.split(/[,;\n\t]+/);
        addEmails(parts);
        setDraft('');
    };

    const send = () => {
        let recipients = emails;
        const pending = draft.trim().replace(/[,;]+$/, '').trim();
        if (pending) {
            if (!isValidEmail(pending)) {
                toast.warning(t('briefings.share_invalid_email'));
                return;
            }
            const normalized = normalizeEmail(pending);
            if (!recipients.includes(normalized)) {
                recipients = [...recipients, normalized];
            }
        }
        if (recipients.length === 0) {
            toast.warning(t('briefings.share_email_required'));
            return;
        }

        setSending(true);
        router.post(
            `/briefings/${briefingId}/share`,
            { emails: recipients, message: form.data.message },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    toast.success(
                        recipients.length === 1
                            ? t('briefings.share_sent')
                            : t('briefings.share_sent_many', { count: recipients.length }),
                        2800,
                    );
                },
                onFinish: () => setSending(false),
            },
        );
    };

    return (
        <>
            <button type="button" className="offacto-brief-scrim on" aria-label={t('common.close')} onClick={onClose} />
            <div
                className="offacto-brief-modal on"
                role="dialog"
                aria-modal="true"
                aria-labelledby="briefing-share-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="offacto-brief-edit-card-h">
                    <h3 id="briefing-share-title">{t('briefings.share_modal_title')}</h3>
                    <button type="button" className="offacto-brief-modal-close" onClick={onClose} aria-label={t('common.close')}>
                        <Icon name="x" />
                    </button>
                </div>
                <div className="offacto-brief-modal-b">
                    <div className="offacto-brief-share-inrow">
                        <input className="offacto-brief-inp" readOnly value={shareUrl} />
                        <button
                            type="button"
                            className="offacto-brief-share-copy"
                            onClick={copyLink}
                            aria-label={t('briefings.copy_link')}
                        >
                            <Icon name="copy" />
                        </button>
                    </div>

                    <label className="offacto-brief-share-field">
                        <span className="offacto-brief-edit-lbl">{t('briefings.share_or_email')}</span>
                        <div
                            className="offacto-brief-email-chips"
                            onClick={() => inputRef.current?.focus()}
                        >
                            {emails.map((email) => (
                                <span key={email} className="offacto-brief-email-chip">
                                    {email}
                                    <button
                                        type="button"
                                        aria-label={t('briefings.remove_email')}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeEmail(email);
                                        }}
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
                                className="offacto-brief-email-chip-input"
                                placeholder={emails.length === 0 ? t('briefings.share_email_placeholder') : ''}
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={handleDraftKeyDown}
                                onBlur={() => commitDraft()}
                                onPaste={handlePaste}
                            />
                        </div>
                        <span className="offacto-brief-meta">{t('briefings.share_email_hint')}</span>
                    </label>

                    <label className="offacto-brief-share-field">
                        <span className="offacto-brief-edit-lbl">{t('briefings.share_message')}</span>
                        <textarea
                            className="offacto-brief-inp"
                            rows={3}
                            placeholder={t('briefings.share_message_placeholder')}
                            value={form.data.message}
                            onChange={(e) => form.setData('message', e.target.value)}
                        />
                    </label>

                    <button
                        type="button"
                        className="offacto-btn-p offacto-brief-share-send"
                        disabled={sending}
                        onClick={send}
                    >
                        <Icon name="send" />
                        {t('briefings.send_link')}
                    </button>
                </div>
            </div>
        </>
    );
}
