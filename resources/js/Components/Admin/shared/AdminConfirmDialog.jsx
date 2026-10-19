import AdminModal, { AdminModalActions } from './AdminModal';

/** SH-008 — destructive / high-impact confirmation with optional consequence list. */
export default function AdminConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = 'Confirm action',
    message,
    consequences = [],
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    loading = false,
}) {
    return (
        <AdminModal
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <AdminModalActions
                    onCancel={onClose}
                    onConfirm={onConfirm}
                    cancelLabel={cancelLabel}
                    confirmLabel={loading ? 'Working…' : confirmLabel}
                    confirmVariant={danger ? 'danger' : 'primary'}
                    confirmDisabled={loading}
                />
            }
        >
            {message && <p className="text-sm leading-relaxed text-slate-600">{message}</p>}
            {consequences.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {consequences.map((line, i) => (
                        <li key={i}>{line}</li>
                    ))}
                </ul>
            )}
        </AdminModal>
    );
}
