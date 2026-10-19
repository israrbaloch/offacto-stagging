import { WORKSPACE_EXTRA_DEFAULTS } from '../../lib/adminSettingOptions';
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
                            Show to new users
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
        const setField = (key, val) => onChange({ ...obj, [key]: val });
        return (
            <AdminSection title={field.label} description="Optional extras applied when a new company workspace is created.">
                <div className="grid gap-4 sm:grid-cols-2">
                    {WORKSPACE_EXTRA_DEFAULTS.map((def) => (
                        <AdminField key={def.key} label={def.label}>
                            <input
                                type={def.type === 'number' ? 'number' : 'text'}
                                className={inputClass}
                                min={def.min}
                                max={def.max}
                                placeholder={def.placeholder}
                                value={obj[def.key] ?? ''}
                                onChange={(e) =>
                                    setField(def.key, def.type === 'number' ? Number(e.target.value) : e.target.value)
                                }
                            />
                        </AdminField>
                    ))}
                </div>
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
