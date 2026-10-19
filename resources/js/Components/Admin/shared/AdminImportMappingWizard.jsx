import { useMemo, useState } from 'react';
import { AdminBadge, AdminButton, AdminField, AdminTable, inputClass, selectClass } from '../ui';

/** SH-012 — map → preview → errors (compact wizard). */
export default function AdminImportMappingWizard({ sourceColumns = [], destinationFields = [], previewRows = [], errors = [], onSubmitMapping }) {
    const [step, setStep] = useState(1);
    const [mapping, setMapping] = useState(() =>
        Object.fromEntries(destinationFields.map((f) => [f.key, sourceColumns[0] || ''])),
    );

    const steps = ['Map fields', 'Preview', 'Errors'];

    const mappedPreview = useMemo(() => {
        return previewRows.slice(0, 5).map((row, i) => {
            const out = { _row: i + 1 };
            destinationFields.forEach((f) => {
                const col = mapping[f.key];
                out[f.key] = col ? row[col] : '';
            });
            return out;
        });
    }, [previewRows, mapping, destinationFields]);

    return (
        <div className="space-y-4">
            <nav className="flex flex-wrap gap-2">
                {steps.map((label, i) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => setStep(i + 1)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${step === i + 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                        {i + 1}. {label}
                    </button>
                ))}
            </nav>

            {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                    {destinationFields.map((f) => (
                        <AdminField key={f.key} label={f.label}>
                            <select className={selectClass} value={mapping[f.key] || ''} onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}>
                                <option value="">— skip —</option>
                                {sourceColumns.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </AdminField>
                    ))}
                    <AdminButton type="button" className="sm:col-span-2" onClick={() => setStep(2)}>
                        Continue to preview
                    </AdminButton>
                </div>
            )}

            {step === 2 && (
                <>
                    <AdminTable columns={['Row', ...destinationFields.map((f) => f.label)]}>
                        {mappedPreview.map((row) => (
                            <tr key={row._row}>
                                <td className="px-4 py-3 text-sm">{row._row}</td>
                                {destinationFields.map((f) => (
                                    <td key={f.key} className="px-4 py-3 text-sm text-slate-600">
                                        {String(row[f.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </AdminTable>
                    <div className="flex gap-2">
                        <AdminButton type="button" variant="secondary" onClick={() => setStep(1)}>
                            Back
                        </AdminButton>
                        <AdminButton type="button" onClick={() => setStep(3)}>
                            View validation
                        </AdminButton>
                    </div>
                </>
            )}

            {step === 3 && (
                <>
                    {errors.length === 0 ? (
                        <AdminBadge tone="success">No validation errors in preview sample.</AdminBadge>
                    ) : (
                        <AdminTable columns={['Row', 'Field', 'Message']}>
                            {errors.map((err, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 text-sm">{err.row}</td>
                                    <td className="px-4 py-3 text-sm">{err.field}</td>
                                    <td className="px-4 py-3 text-sm text-rose-600">{err.message}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}
                    <AdminButton type="button" className="mt-3" onClick={() => onSubmitMapping?.(mapping)}>
                        Confirm import job
                    </AdminButton>
                </>
            )}
        </div>
    );
}
