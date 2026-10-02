import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Icon from '../Components/Icon';
import { t } from '../lib/i18n';

const UiContext = createContext(null);

const VARIANT_STYLES = {
    success: 'bg-slate-900 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-indigo-600 text-white',
    warning: 'bg-amber-500 text-slate-900',
};

function ToastStack({ items, onDismiss }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] flex max-w-sm flex-col gap-2">
            {items.map((item) => (
                <div
                    key={item.id}
                    role="status"
                    className={`pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-lg ring-1 ring-black/5 ${VARIANT_STYLES[item.variant] || VARIANT_STYLES.info}`}
                >
                    <p className="flex-1 leading-snug">{item.message}</p>
                    <button
                        type="button"
                        onClick={() => onDismiss(item.id)}
                        className="shrink-0 rounded-full p-0.5 opacity-80 hover:opacity-100"
                        aria-label={t('common.dismiss')}
                    >
                        <Icon name="close" className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
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
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const pushToast = useCallback(
        (message, variant = 'success', duration = 4500) => {
            if (!message) {
                return;
            }
            const id = ++toastSeq;
            setToasts((prev) => [...prev.slice(-4), { id, message, variant }]);
            if (duration > 0) {
                setTimeout(() => dismissToast(id), duration);
            }
        },
        [dismissToast],
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
            <ToastStack items={toasts} onDismiss={dismissToast} />
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
