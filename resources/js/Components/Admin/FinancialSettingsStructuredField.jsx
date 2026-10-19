import SettingsStructuredField from './SettingsStructuredField';
import {
    AdminButton,
    AdminCheckboxField,
    AdminField,
    AdminSection,
    AdminTextButton,
    inputClass,
} from './ui';

const DOC_TYPES = [
    { id: 'quotation', label: 'Quotations' },
    { id: 'invoice', label: 'Invoices' },
    { id: 'credit_note', label: 'Credit notes' },
];

const ACTIONS = [
    { id: 'create', label: 'Create' },
    { id: 'edit', label: 'Edit' },
    { id: 'send', label: 'Send' },
    { id: 'cancel', label: 'Cancel' },
    { id: 'delete', label: 'Delete' },
];

const VALIDATION_LABELS = {
    seller_vat: 'Seller VAT number',
    seller_address: 'Seller address',
    customer_name: 'Customer name',
    customer_address: 'Customer address',
    sequential_number: 'Sequential invoice number',
    invoice_date: 'Invoice date',
    line_descriptions: 'Line descriptions',
    vat_breakdown: 'VAT rate breakdown',
    totals_match: 'Totals match line items',
    be_company_number: 'Belgian company number (BCE/KBO)',
};

export default function FinancialSettingsStructuredField(props) {
    const { widget, field, value, onChange } = props;

    if (widget === 'document_policy') {
        const policy = value && typeof value === 'object' ? value : {};
        const setAction = (doc, action, enabled) => {
            onChange({
                ...policy,
                [doc]: { ...(policy[doc] || {}), [action]: enabled },
            });
        };
        return (
            <AdminSection title={field.label} description="Control what companies can do with each document type.">
                <div className="overflow-x-auto rounded-xl border border-slate-200/70">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Document</th>
                                {ACTIONS.map((a) => (
                                    <th key={a.id} className="px-3 py-3 text-center">
                                        {a.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DOC_TYPES.map((doc) => (
                                <tr key={doc.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3 font-medium">{doc.label}</td>
                                    {ACTIONS.map((a) => (
                                        <td key={a.id} className="px-3 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={!!policy[doc.id]?.[a.id]}
                                                onChange={(e) => setAction(doc.id, a.id, e.target.checked)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminSection>
        );
    }

    if (widget === 'invoice_validation') {
        const rules = value && typeof value === 'object' ? value : {};
        const toggle = (key) => onChange({ ...rules, [key]: !rules[key] });
        return (
            <AdminSection title={field.label} description="Blocks send until required data is present (Belgium / EU baseline).">
                <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(VALIDATION_LABELS).map(([key, label]) => (
                        <AdminCheckboxField key={key} label={label} checked={!!rules[key]} onChange={() => toggle(key)} />
                    ))}
                </div>
            </AdminSection>
        );
    }

    if (widget === 'reminder_schedule') {
        const days = Array.isArray(value) ? value : [7, 14, 30];
        const update = (next) => onChange(next.filter((d) => d > 0).sort((a, b) => a - b));
        return (
            <AdminSection title={field.label} description="Send payment reminders this many days after the due date.">
                <ul className="space-y-2">
                    {days.map((d, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">Day</span>
                            <input type="number" min={1} className={`${inputClass} w-24`} value={d} onChange={(e) => {
                                const n = [...days];
                                n[i] = Number(e.target.value);
                                update(n);
                            }} />
                            <AdminTextButton type="button" onClick={() => update(days.filter((_, j) => j !== i))}>
                                Remove
                            </AdminTextButton>
                        </li>
                    ))}
                </ul>
                <AdminButton type="button" variant="secondary" className="mt-3" onClick={() => update([...days, 7])}>
                    Add reminder step
                </AdminButton>
            </AdminSection>
        );
    }

    if (widget === 'export_formats') {
        const formats = value && typeof value === 'object' ? value : {};
        const labels = { pdf: 'PDF', zip: 'ZIP bulk', ubl: 'UBL / Peppol XML', accounting_csv: 'Accounting CSV' };
        return (
            <AdminSection title={field.label}>
                <div className="space-y-2">
                    {Object.entries(labels).map(([key, label]) => (
                        <AdminCheckboxField key={key} label={label} checked={!!formats[key]} onChange={() => onChange({ ...formats, [key]: !formats[key] })} />
                    ))}
                </div>
            </AdminSection>
        );
    }

    if (widget === 'payment_methods') {
        const enabled = Array.isArray(value) ? value : [];
        const options = [
            { id: 'bank_transfer', label: 'Bank transfer' },
            { id: 'card', label: 'Card' },
            { id: 'cash', label: 'Cash' },
            { id: 'mollie', label: 'Mollie online' },
        ];
        const toggle = (id) => onChange(enabled.includes(id) ? enabled.filter((x) => x !== id) : [...enabled, id]);
        return (
            <AdminSection title={field.label}>
                <div className="space-y-2">
                    {options.map((o) => (
                        <AdminCheckboxField key={o.id} label={o.label} checked={enabled.includes(o.id)} onChange={() => toggle(o.id)} />
                    ))}
                </div>
            </AdminSection>
        );
    }

    if (widget === 'recurring_intervals') {
        const intervals = value && typeof value === 'object' ? value : {};
        const labels = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };
        return (
            <AdminSection title={field.label}>
                <div className="space-y-2">
                    {Object.entries(labels).map(([key, label]) => (
                        <AdminCheckboxField key={key} label={label} checked={!!intervals[key]} onChange={() => onChange({ ...intervals, [key]: !intervals[key] })} />
                    ))}
                </div>
            </AdminSection>
        );
    }

    if (widget === 'be_vat_rates') {
        const rows = Array.isArray(value) ? value : [];
        const update = (n) => onChange(n);
        return (
            <AdminSection title={field.label} description="Standard Belgian VAT categories. National variations may apply to specific goods/services.">
                <ul className="space-y-2">
                    {rows.map((row, i) => (
                        <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-white p-3">
                            <input className={`${inputClass} flex-1 min-w-[120px]`} value={row.label || ''} placeholder="Label" onChange={(e) => {
                                const n = [...rows];
                                n[i] = { ...n[i], label: e.target.value };
                                update(n);
                            }} />
                            <AdminField label="Rate %" className="w-28">
                                <input type="number" className={inputClass} value={row.rate ?? 0} onChange={(e) => {
                                    const n = [...rows];
                                    n[i] = { ...n[i], rate: Number(e.target.value) };
                                    update(n);
                                }} />
                            </AdminField>
                        </li>
                    ))}
                </ul>
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
