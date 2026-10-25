import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../lib/i18n';

const UiContext = createContext(null);

/** Demo v6 toast pill background (offacto-app-demo.html line 636). */
export const TOAST_BG = '#0E1250';

/** Demo offacto-app-demo.html: icon accent only; pill bg + message stay white. */
const TOAST_ICON_COLOR = {
    success: '#5FD3B3',
    info: '#5FD3B3',
    warning: '#F0B44C',
    error: '#F27D8C',
};

function ToastIcon({ variant }) {
    const color = TOAST_ICON_COLOR[variant] || TOAST_ICON_COLOR.success;

    if (variant === 'error' || variant === 'warning') {
        return (
            <svg viewBox="0 0 24 24" className="offacto-toast__icon shrink-0" style={{ color }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" className="offacto-toast__icon shrink-0" style={{ color }} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

const TOAST_ANIM_MS = 250;

function toastLayoutClass(message) {
    const text = String(message || '').trim();
    if (text.length > 72 || text.includes('\n')) {
        return ' offacto-toast--multiline';
    }
    return '';
}

function ToastStack({ item, visible }) {
    if (!item || typeof document === 'undefined') {
        return null;
    }

    const host = document.getElementById('offacto-toast-root') || document.body;

    return createPortal(
        <div
            className={`offacto-toast${toastLayoutClass(item.message)}${visible ? ' is-visible' : ''}`}
            style={{ backgroundColor: TOAST_BG }}
            role={item.variant === 'error' ? 'alert' : 'status'}
        >
            <ToastIcon variant={item.variant} />
            <span className="offacto-toast__message">{item.message}</span>
        </div>,
        host,
    );
}

function ConfirmDialog({ state, onCancel, onConfirm }) {
    if (!state) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <button type="button" className="absolute inset-0 bg-slate-900/40" onClick={onCancel} aria-label={t('common.cancel')} />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-900">{state.title || t('common.confirm_title')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{state.message}</p>
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                        {state.cancelLabel || t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`rounded-full px-4 py-2 text-sm font-medium text-white ${
                            state.danger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                    >
                        {state.confirmLabel || t('common.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}

let toastSeq = 0;

export function UiProvider({ children }) {
    const [toastItem, setToastItem] = useState(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [confirmState, setConfirmState] = useState(null);
    const toastTimerRef = useRef(null);
    const toastExitTimerRef = useRef(null);
    const toastVisibleRef = useRef(false);

    const dismissToast = useCallback((id) => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
            toastTimerRef.current = null;
        }
        setToastVisible(false);
        toastVisibleRef.current = false;
        if (toastExitTimerRef.current) {
            clearTimeout(toastExitTimerRef.current);
        }
        toastExitTimerRef.current = setTimeout(() => {
            setToastItem((current) => (current?.id === id ? null : current));
            toastExitTimerRef.current = null;
        }, TOAST_ANIM_MS);
    }, []);

    const pushToast = useCallback(
        (message, variant = 'success', duration = 2400) => {
            if (!message) {
                return;
            }
            const text = String(message).trim();
            const showMs = duration > 0 && duration !== 2400 ? duration : text.length > 72 ? 5200 : 2400;
            const id = ++toastSeq;
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
            if (toastExitTimerRef.current) {
                clearTimeout(toastExitTimerRef.current);
                toastExitTimerRef.current = null;
            }

            const wasVisible = toastVisibleRef.current;
            setToastItem({ id, message, variant });

            if (!wasVisible) {
                setToastVisible(false);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setToastVisible(true);
                        toastVisibleRef.current = true;
                    });
                });
            } else {
                setToastVisible(true);
                toastVisibleRef.current = true;
            }

            if (showMs > 0) {
                toastTimerRef.current = setTimeout(() => {
                    dismissToast(id);
                }, showMs);
            }
        },
        [dismissToast],
    );

    useEffect(
        () => () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
            if (toastExitTimerRef.current) {
                clearTimeout(toastExitTimerRef.current);
            }
        },
        [],
    );

    const toast = useMemo(
        () => ({
            success: (message, duration) => pushToast(message, 'success', duration),
            error: (message, duration) => pushToast(message, 'error', duration),
            info: (message, duration) => pushToast(message, 'info', duration),
            warning: (message, duration) => pushToast(message, 'warning', duration),
        }),
        [pushToast],
    );

    const confirm = useCallback(
        ({ title, message, confirmLabel, cancelLabel, danger = false }) =>
            new Promise((resolve) => {
                setConfirmState({
                    title,
                    message,
                    confirmLabel,
                    cancelLabel,
                    danger,
                    resolve,
                });
            }),
        [],
    );

    const closeConfirm = (result) => {
        confirmState?.resolve?.(result);
        setConfirmState(null);
    };

    const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

    return (
        <UiContext.Provider value={value}>
            {children}
            <ToastStack item={toastItem} visible={toastVisible} />
            <ConfirmDialog state={confirmState} onCancel={() => closeConfirm(false)} onConfirm={() => closeConfirm(true)} />
        </UiContext.Provider>
    );
}

export function useUi() {
    const ctx = useContext(UiContext);
    if (!ctx) {
        throw new Error('useUi must be used within UiProvider');
    }
    return ctx;
}
