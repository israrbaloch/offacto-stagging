import SettingsStructuredField from './SettingsStructuredField';
import { AdminButton, AdminField, AdminSection, AdminTextButton, inputClass } from './ui';

export default function InfrastructureSettingsStructuredField(props) {
    const { widget, field, value, onChange } = props;

    if (widget === 'backup_destinations') {
        const rows = Array.isArray(value) ? value : [];
        const patch = (i, key, val) => {
            const next = [...rows];
            next[i] = { ...next[i], [key]: val };
            onChange(next);
        };
        return (
            <AdminSection title={field.label}>
                {rows.map((row, i) => (
                    <div key={i} className="mb-2 grid gap-2 rounded-xl border border-slate-200/70 p-3 sm:grid-cols-2">
                        <AdminField label="Name">
                            <input className={inputClass} value={row.name || ''} onChange={(e) => patch(i, 'name', e.target.value)} />
                        </AdminField>
                        <AdminField label="Region">
                            <input className={inputClass} value={row.region || ''} onChange={(e) => patch(i, 'region', e.target.value)} />
                        </AdminField>
                        <AdminTextButton type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                            Remove
                        </AdminTextButton>
                    </div>
                ))}
                <AdminButton type="button" variant="secondary" onClick={() => onChange([...rows, { name: '', region: 'EEA' }])}>
                    Add destination
                </AdminButton>
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
