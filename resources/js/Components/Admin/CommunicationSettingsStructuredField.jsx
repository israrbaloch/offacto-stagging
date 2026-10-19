import SettingsStructuredField from './SettingsStructuredField';
import { AdminButton, AdminField, AdminSection, AdminTextButton, inputClass, selectClass } from './ui';

export default function CommunicationSettingsStructuredField(props) {
    const { widget, field, value, onChange } = props;

    if (widget === 'email_templates' || widget === 'notification_defaults') {
        return <SettingsStructuredField {...props} />;
    }

    if (widget === 'custom_merge_codes') {
        const rows = Array.isArray(value) ? value : [];
        const setRow = (i, key, val) => {
            const next = [...rows];
            next[i] = { ...next[i], [key]: val };
            onChange(next);
        };
        return (
            <AdminSection title={field.label} description="Must use #LIKE_THIS# syntax and be documented before use in templates.">
                {rows.map((row, i) => (
                    <div key={i} className="mb-3 grid gap-2 rounded-xl border border-slate-200/70 p-4 sm:grid-cols-2">
                        <AdminField label="Code">
                            <input className={inputClass} value={row.code || ''} onChange={(e) => setRow(i, 'code', e.target.value.toUpperCase())} placeholder="#MYCODE#" />
                        </AdminField>
                        <AdminField label="Contexts (comma-separated)">
                            <input className={inputClass} value={(row.contexts || []).join(', ')} onChange={(e) => setRow(i, 'contexts', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
                        </AdminField>
                        <AdminField label="Description" className="sm:col-span-2">
                            <input className={inputClass} value={row.description || ''} onChange={(e) => setRow(i, 'description', e.target.value)} />
                        </AdminField>
                        <AdminTextButton type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                            Remove
                        </AdminTextButton>
                    </div>
                ))}
                <AdminButton type="button" variant="secondary" onClick={() => onChange([...rows, { code: '', contexts: [], description: '' }])}>
                    Add custom code
                </AdminButton>
            </AdminSection>
        );
    }

    if (widget === 'notification_rules') {
        const rules = Array.isArray(value) ? value : [];
        const patch = (i, key, val) => {
            const next = [...rules];
            next[i] = { ...next[i], [key]: val };
            onChange(next);
        };
        return (
            <AdminSection title={field.label}>
                {rules.map((rule, i) => (
                    <div key={i} className="mb-3 grid gap-2 rounded-xl border border-slate-200/70 p-4 sm:grid-cols-2">
                        <AdminField label="Event">
                            <input className={inputClass} value={rule.event || ''} onChange={(e) => patch(i, 'event', e.target.value)} />
                        </AdminField>
                        <AdminField label="Channel">
                            <select className={selectClass} value={rule.channel || 'email'} onChange={(e) => patch(i, 'channel', e.target.value)}>
                                <option value="email">Email</option>
                                <option value="in_app">In-app</option>
                            </select>
                        </AdminField>
                        <AdminField label="Roles (comma-separated)">
                            <input className={inputClass} value={(rule.roles || []).join(', ')} onChange={(e) => patch(i, 'roles', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
                        </AdminField>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!rule.enabled} onChange={(e) => patch(i, 'enabled', e.target.checked)} />
                            Enabled
                        </label>
                    </div>
                ))}
                <AdminButton type="button" variant="secondary" onClick={() => onChange([...rules, { event: '', channel: 'email', roles: ['owner'], enabled: true }])}>
                    Add rule
                </AdminButton>
            </AdminSection>
        );
    }

    if (widget === 'scheduled_notifications') {
        const v = value && typeof value === 'object' ? value : {};
        const set = (key, val) => onChange({ ...v, [key]: val });
        const daysField = (key, label) => (
            <AdminField label={label}>
                <input
                    className={inputClass}
                    value={(v[key] || []).join(', ')}
                    onChange={(e) =>
                        set(
                            key,
                            e.target.value
                                .split(',')
                                .map((s) => parseInt(s.trim(), 10))
                                .filter((n) => !Number.isNaN(n)),
                        )
                    }
                    placeholder="7, 3, 1"
                />
            </AdminField>
        );
        return (
            <AdminSection title={field.label}>
                {daysField('trial_expiry_days', 'Trial expiry reminders (days before)')}
                {daysField('subscription_renewal_days', 'Subscription renewal reminders (days before)')}
                <label className="mt-2 flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!v.invoice_reminder_use_company_settings} onChange={(e) => set('invoice_reminder_use_company_settings', e.target.checked)} />
                    Invoice reminders follow company settings
                </label>
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
