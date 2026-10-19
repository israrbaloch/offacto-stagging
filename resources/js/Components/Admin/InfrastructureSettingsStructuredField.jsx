import { Link } from '@inertiajs/react';
import { BACKUP_REGIONS } from '../../lib/adminSettingOptions';
import SettingsStructuredField from './SettingsStructuredField';
import { AdminButton, AdminField, AdminSection, AdminTextButton, inputClass, selectClass } from './ui';

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
            <AdminSection title={field.label} description="Where backups are expected to be stored (for documentation and audits).">
                {rows.map((row, i) => (
                    <div key={i} className="mb-2 grid gap-2 rounded-xl border border-slate-200/70 p-3 sm:grid-cols-2">
                        <AdminField label="Location name">
                            <input className={inputClass} value={row.name || ''} onChange={(e) => patch(i, 'name', e.target.value)} placeholder="Primary cloud bucket" />
                        </AdminField>
                        <AdminField label="Region">
                            <select className={selectClass} value={row.region || 'EEA'} onChange={(e) => patch(i, 'region', e.target.value)}>
                                {BACKUP_REGIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
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

    if (widget === 'maintenance_notice') {
        return (
            <AdminSection title="Customer-facing maintenance mode">
                <p className="text-sm leading-relaxed text-slate-600">
                    To show a maintenance page to customers, use{' '}
                    <Link href="/admin/settings/maintenance" className="font-medium text-slate-900 underline">
                        Platform settings → Maintenance mode
                    </Link>
                    . This avoids maintaining the same switch in two places.
                </p>
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
