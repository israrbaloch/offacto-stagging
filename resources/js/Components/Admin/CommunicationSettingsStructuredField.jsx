import { MERGE_CODE_CONTEXTS, NOTIFICATION_EVENTS, NOTIFICATION_ROLES } from '../../lib/adminSettingOptions';
import EmailRecipientListField from './EmailRecipientListField';
import SettingsStructuredField from './SettingsStructuredField';
import { AdminButton, AdminCheckboxField, AdminField, AdminSection, AdminTextButton, checkboxClass, inputClass, selectClass } from './ui';

export default function CommunicationSettingsStructuredField(props) {
    const { widget, field, value, onChange } = props;

    if (widget === 'email_templates' || widget === 'notification_defaults') {
        return <SettingsStructuredField {...props} />;
    }

    if (widget === 'email_recipient_list') {
        return (
            <EmailRecipientListField
                title={field.label}
                description="Each address receives a copy. Leave empty if not needed."
                value={value}
                onChange={onChange}
            />
        );
    }

    if (widget === 'custom_merge_codes') {
        const rows = Array.isArray(value) ? value : [];
        const setRow = (i, key, val) => {
            const next = [...rows];
            next[i] = { ...next[i], [key]: val };
            onChange(next);
        };
        const toggleContext = (i, ctx) => {
            const current = rows[i]?.contexts || [];
            const next = current.includes(ctx) ? current.filter((c) => c !== ctx) : [...current, ctx];
            setRow(i, 'contexts', next);
        };
        return (
            <AdminSection
                title={field.label}
                description="Add your own personalization codes (for example #PROJECTNAME#). Use them only in templates after documenting what they mean."
            >
                {rows.map((row, i) => (
                    <div key={i} className="mb-3 grid gap-2 rounded-xl border border-slate-200/70 p-4">
                        <AdminField label="Code (include # symbols)">
                            <input
                                className={inputClass}
                                value={row.code || ''}
                                onChange={(e) => setRow(i, 'code', e.target.value.toUpperCase())}
                                placeholder="#MYCODE#"
                            />
                        </AdminField>
                        <div>
                            <p className="mb-2 text-xs font-medium text-slate-600">Use in these message types</p>
                            <div className="flex flex-wrap gap-3">
                                {MERGE_CODE_CONTEXTS.map((ctx) => (
                                    <label key={ctx.value} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            className={checkboxClass}
                                            checked={(row.contexts || []).includes(ctx.value)}
                                            onChange={() => toggleContext(i, ctx.value)}
                                        />
                                        {ctx.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <AdminField label="What this code represents">
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
        const toggleRole = (i, role) => {
            const current = rules[i]?.roles || [];
            const next = current.includes(role) ? current.filter((r) => r !== role) : [...current, role];
            patch(i, 'roles', next);
        };
        return (
            <AdminSection title={field.label} description="Choose who gets notified, and whether it is by email or in the app.">
                {rules.map((rule, i) => (
                    <div key={i} className="mb-3 grid gap-2 rounded-xl border border-slate-200/70 p-4 sm:grid-cols-2">
                        <AdminField label="When">
                            <select className={selectClass} value={rule.event || ''} onChange={(e) => patch(i, 'event', e.target.value)}>
                                <option value="">Choose event…</option>
                                {NOTIFICATION_EVENTS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </AdminField>
                        <AdminField label="Delivery">
                            <select className={selectClass} value={rule.channel || 'email'} onChange={(e) => patch(i, 'channel', e.target.value)}>
                                <option value="email">Email</option>
                                <option value="in_app">In-app notification</option>
                            </select>
                        </AdminField>
                        <div className="sm:col-span-2">
                            <p className="mb-2 text-xs font-medium text-slate-600">Notify these roles</p>
                            <div className="flex flex-wrap gap-3">
                                {NOTIFICATION_ROLES.map((role) => (
                                    <label key={role.value} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            className={checkboxClass}
                                            checked={(rule.roles || []).includes(role.value)}
                                            onChange={() => toggleRole(i, role.value)}
                                        />
                                        {role.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <AdminCheckboxField label="Rule is active" checked={!!rule.enabled} onChange={(e) => patch(i, 'enabled', e.target.checked)} />
                        <AdminTextButton type="button" className="self-center" onClick={() => onChange(rules.filter((_, j) => j !== i))}>
                            Remove rule
                        </AdminTextButton>
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
            <AdminField label={label} hint="Separate days with commas, e.g. 7, 3, 1">
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
                {daysField('trial_expiry_days', 'Trial ending — remind this many days before')}
                {daysField('subscription_renewal_days', 'Subscription renewal — remind this many days before')}
                <div className="mt-2">
                    <AdminCheckboxField
                        label="Invoice reminders follow each company's own settings"
                        checked={!!v.invoice_reminder_use_company_settings}
                        onChange={(e) => set('invoice_reminder_use_company_settings', e.target.checked)}
                    />
                </div>
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
