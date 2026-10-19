import SettingsStructuredField from './SettingsStructuredField';
import { AdminButton, AdminField, AdminSection, AdminTextButton, inputClass } from './ui';

export default function SupportSettingsStructuredField(props) {
    const { widget, field, value, onChange } = props;

    if (widget === 'sla_priorities') {
        const map = value && typeof value === 'object' ? value : {};
        const keys = ['urgent', 'high', 'normal', 'low'];
        return (
            <AdminSection title={field.label}>
                <div className="grid gap-3 sm:grid-cols-2">
                    {keys.map((key) => (
                        <AdminField key={key} label={key}>
                            <input type="number" className={inputClass} value={map[key] ?? 24} onChange={(e) => onChange({ ...map, [key]: Number(e.target.value) })} />
                        </AdminField>
                    ))}
                </div>
            </AdminSection>
        );
    }

    if (widget === 'working_hours') {
        const v = value && typeof value === 'object' ? value : {};
        const set = (k, val) => onChange({ ...v, [k]: val });
        return (
            <AdminSection title={field.label}>
                <div className="grid gap-3 sm:grid-cols-2">
                    <AdminField label="Timezone">
                        <input className={inputClass} value={v.timezone || 'Europe/Brussels'} onChange={(e) => set('timezone', e.target.value)} />
                    </AdminField>
                    <AdminField label="Days">
                        <input className={inputClass} value={v.days || 'Mon-Fri'} onChange={(e) => set('days', e.target.value)} />
                    </AdminField>
                    <AdminField label="Start">
                        <input className={inputClass} value={v.start || '09:00'} onChange={(e) => set('start', e.target.value)} />
                    </AdminField>
                    <AdminField label="End">
                        <input className={inputClass} value={v.end || '17:00'} onChange={(e) => set('end', e.target.value)} />
                    </AdminField>
                </div>
            </AdminSection>
        );
    }

    if (widget === 'escalation_paths') {
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
                        <AdminField label="Type">
                            <input className={inputClass} value={row.type || ''} onChange={(e) => patch(i, 'type', e.target.value)} />
                        </AdminField>
                        <AdminField label="Team">
                            <input className={inputClass} value={row.team || ''} onChange={(e) => patch(i, 'team', e.target.value)} />
                        </AdminField>
                        <AdminTextButton type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                            Remove
                        </AdminTextButton>
                    </div>
                ))}
                <AdminButton type="button" variant="secondary" onClick={() => onChange([...rows, { type: '', team: '' }])}>
                    Add path
                </AdminButton>
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
