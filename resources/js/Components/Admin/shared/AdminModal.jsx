import { useEffect } from 'react';
import { AdminButton, AdminTextButton } from '../ui';

/** SH-008 / SH-009 base — centered admin modal with backdrop. */
export default function AdminModal({ open, onClose, title, description, children, footer, size = 'md' }) {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    const maxW = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md';

    return (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center">
            <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close dialog" onClick={onClose} />
            <div className={`relative z-10 w-full ${maxW} rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/80`} role="dialog" aria-modal="true">
                {(title || description) && (
                    <div className="border-b border-slate-100 px-5 py-4">
                        {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
                        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                    </div>
                )}
                <div className="px-5 py-4">{children}</div>
                {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">{footer}</div>}
            </div>
        </div>
    );
}

export function AdminModalActions({ onCancel, onConfirm, cancelLabel = 'Cancel', confirmLabel = 'Confirm', confirmVariant = 'primary', confirmDisabled }) {
    return (
        <>
            <AdminTextButton type="button" onClick={onCancel}>
                {cancelLabel}
            </AdminTextButton>
            <AdminButton type="button" variant={confirmVariant} disabled={confirmDisabled} onClick={onConfirm}>
                {confirmLabel}
            </AdminButton>
        </>
    );
}
