import SettingsStructuredField from './SettingsStructuredField';
import { AdminButton, AdminField, AdminSection, AdminTextButton, inputClass } from './ui';

export default function ProductSettingsStructuredField(props) {
    const { widget, field, value, onChange } = props;

    if (widget === 'onboarding_checklist') {
        const rows = Array.isArray(value) ? value : [];
        const patch = (i, key, val) => {
            const next = [...rows];
            next[i] = { ...next[i], [key]: val };
            onChange(next);
        };
        return (
            <AdminSection title={field.label}>
                {rows.map((row, i) => (
                    <div key={row.id || i} className="mb-2 grid gap-2 rounded-xl border border-slate-200/70 p-3 sm:grid-cols-[1fr_auto_auto]">
                        <AdminField label="Step label">
                            <input className={inputClass} value={row.label || ''} onChange={(e) => patch(i, 'label', e.target.value)} />
                        </AdminField>
                        <label className="flex items-end gap-2 pb-2 text-sm">
                            <input type="checkbox" checked={!!row.enabled} onChange={(e) => patch(i, 'enabled', e.target.checked)} />
                            Enabled
                        </label>
                        <AdminTextButton type="button" className="self-end pb-2" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                            Remove
                        </AdminTextButton>
                    </div>
                ))}
                <AdminButton type="button" variant="secondary" onClick={() => onChange([...rows, { id: `step_${rows.length + 1}`, label: '', enabled: true }])}>
                    Add step
                </AdminButton>
            </AdminSection>
        );
    }

    if (widget === 'workspace_defaults') {
        const obj = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        const entries = Object.entries(obj);
        const setKey = (oldKey, newKey, val) => {
            const next = { ...obj };
            delete next[oldKey];
            if (newKey) next[newKey] = val;
            onChange(next);
        };
        return (
            <AdminSection title={field.label}>
                <p className="mb-3 text-xs text-slate-500">Applied when provisioning new workspaces only.</p>
                {entries.map(([k, v]) => (
                    <div key={k} className="mb-2 grid gap-2 sm:grid-cols-2">
                        <input className={inputClass} value={k} onChange={(e) => setKey(k, e.target.value, v)} placeholder="Key" />
                        <input className={inputClass} value={String(v)} onChange={(e) => setKey(k, k, e.target.value)} placeholder="Value" />
                    </div>
                ))}
                <AdminButton type="button" variant="secondary" onClick={() => onChange({ ...obj, [`key_${entries.length + 1}`]: '' })}>
                    Add default
                </AdminButton>
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
