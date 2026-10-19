import SettingsStructuredField from './SettingsStructuredField';
import { AdminButton, AdminField, AdminSection, AdminTextButton, inputClass } from './ui';

const JURISDICTIONS = [
    { code: 'BE', label: 'Belgium' },
    { code: 'NL', label: 'Netherlands' },
    { code: 'FR', label: 'France' },
    { code: 'EU', label: 'EU (generic)' },
];

export default function ComplianceSettingsStructuredField(props) {
    const { widget, field, value, onChange } = props;

    if (widget === 'jurisdiction_profiles') {
        const profiles = value && typeof value === 'object' ? value : {};
        const update = (code, key, val) => {
            onChange({
                ...profiles,
                [code]: { ...(profiles[code] || {}), [key]: val },
            });
        };
        return (
            <AdminSection title={field.label}>
                {JURISDICTIONS.map(({ code, label }) => (
                    <div key={code} className="mb-4 rounded-xl border border-slate-200/70 p-4">
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={!!profiles[code]?.enabled}
                                onChange={(e) => update(code, 'enabled', e.target.checked)}
                            />
                            {label} ({code})
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <AdminField label="Privacy framework">
                                <input
                                    className={inputClass}
                                    value={profiles[code]?.privacy_law || ''}
                                    onChange={(e) => update(code, 'privacy_law', e.target.value)}
                                />
                            </AdminField>
                            <AdminField label="Invoice rules summary">
                                <input
                                    className={inputClass}
                                    value={profiles[code]?.invoice_rules || ''}
                                    onChange={(e) => update(code, 'invoice_rules', e.target.value)}
                                />
                            </AdminField>
                            <AdminField label="Retention (years, invoices)">
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={profiles[code]?.retention_years_invoices ?? 7}
                                    onChange={(e) => update(code, 'retention_years_invoices', Number(e.target.value))}
                                />
                            </AdminField>
                        </div>
                    </div>
                ))}
            </AdminSection>
        );
    }

    if (widget === 'jurisdictional_tax') {
        const rules = Array.isArray(value) ? value : [];
        const setRule = (index, key, val) => {
            const next = [...rules];
            next[index] = { ...next[index], [key]: val };
            onChange(next);
        };
        const addRule = () =>
            onChange([
                ...rules,
                { jurisdiction: 'BE', effective_from: new Date().toISOString().slice(0, 10), standard_rate: 21, reduced_rates: [6, 12], reverse_charge_note: '' },
            ]);
        return (
            <AdminSection title={field.label}>
                {rules.map((rule, i) => (
                    <div key={i} className="mb-3 grid gap-2 rounded-xl border border-slate-200/70 p-4 sm:grid-cols-2">
                        <AdminField label="Jurisdiction">
                            <input className={inputClass} value={rule.jurisdiction || ''} onChange={(e) => setRule(i, 'jurisdiction', e.target.value)} />
                        </AdminField>
                        <AdminField label="Effective from">
                            <input type="date" className={inputClass} value={rule.effective_from || ''} onChange={(e) => setRule(i, 'effective_from', e.target.value)} />
                        </AdminField>
                        <AdminField label="Standard rate %">
                            <input type="number" className={inputClass} value={rule.standard_rate ?? 21} onChange={(e) => setRule(i, 'standard_rate', Number(e.target.value))} />
                        </AdminField>
                        <AdminField label="Reverse charge note">
                            <input className={inputClass} value={rule.reverse_charge_note || ''} onChange={(e) => setRule(i, 'reverse_charge_note', e.target.value)} />
                        </AdminField>
                        <AdminTextButton type="button" onClick={() => onChange(rules.filter((_, j) => j !== i))}>
                            Remove
                        </AdminTextButton>
                    </div>
                ))}
                <AdminButton type="button" variant="secondary" onClick={addRule}>
                    Add tax rule set
                </AdminButton>
            </AdminSection>
        );
    }

    if (widget === 'einvoice_formats') {
        const formats = value && typeof value === 'object' ? value : {};
        const labels = {
            ubl_peppol: 'UBL Peppol BIS',
            ubl_be: 'UBL (Belgium)',
            pdf_a: 'PDF/A archive',
            factur_x: 'Factur-X',
        };
        return (
            <AdminSection title={field.label}>
                {Object.entries(labels).map(([key, label]) => (
                    <label key={key} className="mb-2 flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!formats[key]} onChange={(e) => onChange({ ...formats, [key]: e.target.checked })} />
                        {label}
                    </label>
                ))}
            </AdminSection>
        );
    }

    if (widget === 'subprocessor_list' || widget === 'processing_register') {
        const rows = Array.isArray(value) ? value : [];
        const cols =
            widget === 'subprocessor_list'
                ? ['name', 'purpose', 'region', 'transfer_mechanism']
                : ['category', 'purpose', 'legal_basis', 'retention'];
        const labels =
            widget === 'subprocessor_list'
                ? { name: 'Name', purpose: 'Purpose', region: 'Region', transfer_mechanism: 'Transfer mechanism' }
                : { category: 'Category', purpose: 'Purpose', legal_basis: 'Legal basis', retention: 'Retention' };
        const setCell = (i, col, val) => {
            const next = [...rows];
            next[i] = { ...next[i], [col]: val };
            onChange(next);
        };
        const emptyRow = () =>
            widget === 'subprocessor_list'
                ? { name: '', purpose: '', region: 'EEA', transfer_mechanism: '' }
                : { category: '', purpose: '', legal_basis: '', retention: '' };
        return (
            <AdminSection title={field.label}>
                {rows.map((row, i) => (
                    <div key={i} className="mb-3 grid gap-2 rounded-xl border border-slate-200/70 p-4 sm:grid-cols-2">
                        {cols.map((col) => (
                            <AdminField key={col} label={labels[col]}>
                                <input className={inputClass} value={row[col] || ''} onChange={(e) => setCell(i, col, e.target.value)} />
                            </AdminField>
                        ))}
                        <AdminTextButton type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                            Remove row
                        </AdminTextButton>
                    </div>
                ))}
                <AdminButton type="button" variant="secondary" onClick={() => onChange([...rows, emptyRow()])}>
                    Add row
                </AdminButton>
            </AdminSection>
        );
    }

    if (widget === 'export_redactions') {
        const flags = value && typeof value === 'object' ? value : {};
        const items = [
            { id: 'national_id', label: 'National ID numbers' },
            { id: 'bank_full', label: 'Full bank account numbers' },
            { id: 'voice_recordings', label: 'Voice recording files' },
        ];
        return (
            <AdminSection title={field.label}>
                {items.map(({ id, label }) => (
                    <label key={id} className="mb-2 flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!flags[id]} onChange={(e) => onChange({ ...flags, [id]: e.target.checked })} />
                        Redact {label}
                    </label>
                ))}
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
