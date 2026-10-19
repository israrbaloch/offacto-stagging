import {
    ESCALATION_TYPES,
    SLA_PRIORITY_LABELS,
    SUPPORT_TEAMS,
    TIMEZONE_OPTIONS,
    WORKING_DAY_PRESETS,
} from '../../lib/adminSettingOptions';
import EmailRecipientListField from './EmailRecipientListField';
import SettingsStructuredField from './SettingsStructuredField';
import { AdminButton, AdminField, AdminSection, AdminTextButton, inputClass, selectClass } from './ui';

export default function SupportSettingsStructuredField(props) {
    const { widget, field, value, onChange } = props;

    if (widget === 'email_recipient_list') {
        return (
            <EmailRecipientListField
                title={field.label}
                description="Email only — no in-app alerts. Platform admins always receive in-app and email separately."
                value={value}
                onChange={onChange}
            />
        );
    }

    if (widget === 'sla_priorities') {
        const map = value && typeof value === 'object' ? value : {};
        return (
            <AdminSection title={field.label} description="Target first-response times in business hours.">
                <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(SLA_PRIORITY_LABELS).map(([key, label]) => (
                        <AdminField key={key} label={label}>
                            <input
                                type="number"
                                min={1}
                                className={inputClass}
                                value={map[key] ?? 24}
                                onChange={(e) => onChange({ ...map, [key]: Number(e.target.value) })}
                            />
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
            <AdminSection title={field.label} description="Used for SLA calculations and auto-replies outside these hours.">
                <div className="grid gap-3 sm:grid-cols-2">
                    <AdminField label="Time zone">
                        <select className={selectClass} value={v.timezone || 'Europe/Brussels'} onChange={(e) => set('timezone', e.target.value)}>
                            {TIMEZONE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </AdminField>
                    <AdminField label="Working days">
                        <select className={selectClass} value={v.days || 'Mon-Fri'} onChange={(e) => set('days', e.target.value)}>
                            {WORKING_DAY_PRESETS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </AdminField>
                    <AdminField label="Day starts">
                        <input type="time" className={inputClass} value={v.start || '09:00'} onChange={(e) => set('start', e.target.value)} />
                    </AdminField>
                    <AdminField label="Day ends">
                        <input type="time" className={inputClass} value={v.end || '17:00'} onChange={(e) => set('end', e.target.value)} />
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
            <AdminSection title={field.label} description="Who should be notified when a ticket matches each situation.">
                {rows.map((row, i) => (
                    <div key={i} className="mb-2 grid gap-2 rounded-xl border border-slate-200/70 p-3 sm:grid-cols-2">
                        <AdminField label="When this happens">
                            <select className={selectClass} value={row.type || ''} onChange={(e) => patch(i, 'type', e.target.value)}>
                                <option value="">Choose…</option>
                                {ESCALATION_TYPES.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </AdminField>
                        <AdminField label="Route to team">
                            <select className={selectClass} value={row.team || ''} onChange={(e) => patch(i, 'team', e.target.value)}>
                                <option value="">Choose…</option>
                                {SUPPORT_TEAMS.map((opt) => (
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
                <AdminButton type="button" variant="secondary" onClick={() => onChange([...rows, { type: '', team: '' }])}>
                    Add escalation rule
                </AdminButton>
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
