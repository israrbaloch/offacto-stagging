import { useState } from 'react';
import { AdminField, checkboxClass, inputClass, selectClass } from '../ui';
import AdminModal, { AdminModalActions } from './AdminModal';

const textareaClass = `${inputClass} min-h-[80px]`;

/** SH-011 — export scope, format, fields, date range. */
export default function AdminExportDialog({ open, onClose, onSubmit, title = 'Export data', formats = ['csv', 'xlsx'], fieldOptions = [] }) {
    const [format, setFormat] = useState(formats[0] || 'csv');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [fields, setFields] = useState(() => fieldOptions.map((f) => f.key));
    const [scopeAck, setScopeAck] = useState(false);

    const toggleField = (key) => {
        setFields((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
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
                    onConfirm={() => onSubmit?.({ format, dateFrom, dateTo, fields, scopeAck })}
                    confirmLabel="Start export"
                    confirmDisabled={!scopeAck || fields.length === 0}
                />
            }
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="Format">
                    <select className={selectClass} value={format} onChange={(e) => setFormat(e.target.value)}>
                        {formats.map((f) => (
                            <option key={f} value={f}>
                                {f.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </AdminField>
                <AdminField label="Date from">
                    <input type="date" className={inputClass} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </AdminField>
                <AdminField label="Date to">
                    <input type="date" className={inputClass} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </AdminField>
            </div>
            {fieldOptions.length > 0 && (
                <div className="mt-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Fields</p>
                    <div className="flex flex-wrap gap-2">
                        {fieldOptions.map((f) => (
                            <label key={f.key} className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs">
                                <input type="checkbox" className={checkboxClass} checked={fields.includes(f.key)} onChange={() => toggleField(f.key)} />
                                {f.label}
                            </label>
                        ))}
                    </div>
                </div>
            )}
            <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" className={`${checkboxClass} mt-0.5`} checked={scopeAck} onChange={(e) => setScopeAck(e.target.checked)} />
                Export is within my authorized scope and will be handled per retention policy.
            </label>
        </AdminModal>
    );
}
