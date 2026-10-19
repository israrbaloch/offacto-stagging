import { useState } from 'react';
import { AdminField, checkboxClass, inputClass } from '../ui';

const textareaClass = `${inputClass} min-h-[80px]`;
import AdminModal, { AdminModalActions } from './AdminModal';

/** SH-009 — approve/reject with required decision reason. */
export default function AdminApprovalDialog({
    open,
    onClose,
    onSubmit,
    title = 'Review request',
    summary,
    approveLabel = 'Approve',
    rejectLabel = 'Reject',
}) {
    const [decision, setDecision] = useState('approve');
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onSubmit?.({ decision, reason: reason.trim() });
        setReason('');
        setDecision('approve');
    };

    return (
        <AdminModal
            open={open}
            onClose={onClose}
            title={title}
            size="lg"
            footer={
                <AdminModalActions
                    onCancel={onClose}
                    onConfirm={handleConfirm}
                    confirmLabel={decision === 'approve' ? approveLabel : rejectLabel}
                    confirmVariant={decision === 'reject' ? 'danger' : 'primary'}
                    confirmDisabled={reason.trim().length < 3}
                />
            }
        >
            {summary && <p className="mb-4 text-sm text-slate-600">{summary}</p>}
            <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                    <input type="radio" name="decision" checked={decision === 'approve'} onChange={() => setDecision('approve')} />
                    Approve
                </label>
                <label className="flex items-center gap-2">
                    <input type="radio" name="decision" checked={decision === 'reject'} onChange={() => setDecision('reject')} />
                    Reject
                </label>
            </div>
            <AdminField label="Decision reason" className="mt-4">
                <textarea className={textareaClass} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required for audit trail" rows={3} />
            </AdminField>
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <input type="checkbox" className={checkboxClass} required readOnly checked />
                I confirm this decision is authorized and documented.
            </label>
        </AdminModal>
    );
}
