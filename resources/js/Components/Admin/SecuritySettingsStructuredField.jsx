import { PRIVILEGED_SOD_ACTIONS } from '../../lib/adminSettingOptions';
import SettingsStructuredField from './SettingsStructuredField';
import { AdminButton, AdminField, AdminSection, AdminTextButton, inputClass, selectClass } from './ui';

export default function SecuritySettingsStructuredField(props) {
    const { widget, field, value, onChange } = props;

    if (widget === 'rate_limits') {
        const map = value && typeof value === 'object' ? value : {};
        const labels = {
            login: 'Sign-in attempts per minute',
            register: 'New registrations per hour',
            password_reset: 'Password reset requests per hour',
            public_quote: 'Public quotation page views per minute',
            briefing_form: 'Briefing form submissions per hour',
        };
        return (
            <AdminSection title={field.label} description="Limits abusive traffic. Your hosting layer may apply additional protection.">
                {Object.entries(labels).map(([key, label]) => (
                    <AdminField key={key} label={label}>
                        <input type="number" min={1} className={inputClass} value={map[key] ?? 10} onChange={(e) => onChange({ ...map, [key]: Number(e.target.value) })} />
                    </AdminField>
                ))}
            </AdminSection>
        );
    }

    if (widget === 'upload_mimes') {
        const flags = value && typeof value === 'object' ? value : {};
        const items = [
            { id: 'images', label: 'Images (JPEG, PNG, WebP)' },
            { id: 'pdf', label: 'PDF documents' },
            { id: 'office', label: 'Word and Excel documents' },
            { id: 'audio', label: 'Audio (voice notes)' },
        ];
        return (
            <AdminSection title={field.label}>
                {items.map(({ id, label }) => (
                    <label key={id} className="mb-2 flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!flags[id]} onChange={(e) => onChange({ ...flags, [id]: e.target.checked })} />
                        {label}
                    </label>
                ))}
            </AdminSection>
        );
    }

    if (widget === 'privileged_actions') {
        const map = value && typeof value === 'object' ? value : {};
        const items = [
            { id: 'permanent_delete', label: 'Permanent deletion' },
            { id: 'bulk_export', label: 'Bulk export' },
            { id: 'refund_issue', label: 'Issue refund' },
            { id: 'credential_change', label: 'Credential change' },
            { id: 'company_suspend', label: 'Company suspend' },
        ];
        return (
            <AdminSection title={field.label}>
                {items.map(({ id, label }) => (
                    <label key={id} className="mb-2 flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!map[id]} onChange={(e) => onChange({ ...map, [id]: e.target.checked })} />
                        Require extra confirmation for: {label}
                    </label>
                ))}
            </AdminSection>
        );
    }

    if (widget === 'sod_rules') {
        const rows = Array.isArray(value) ? value : [];
        const patch = (i, key, val) => {
            const next = [...rows];
            next[i] = { ...next[i], [key]: val };
            onChange(next);
        };
        return (
            <AdminSection title={field.label} description="Sensitive actions can require approval from a second platform admin.">
                {rows.map((row, i) => (
                    <div key={i} className="mb-2 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200/70 p-3">
                        <AdminField label="Action">
                            <select className={selectClass} value={row.action || ''} onChange={(e) => patch(i, 'action', e.target.value)}>
                                <option value="">Choose…</option>
                                {PRIVILEGED_SOD_ACTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </AdminField>
                        <label className="flex items-center gap-2 pb-2 text-sm">
                            <input type="checkbox" checked={!!row.require_second_admin} onChange={(e) => patch(i, 'require_second_admin', e.target.checked)} />
                            Requires second admin
                        </label>
                        <AdminTextButton type="button" className="pb-2" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                            Remove
                        </AdminTextButton>
                    </div>
                ))}
                <AdminButton type="button" variant="secondary" onClick={() => onChange([...rows, { action: '', require_second_admin: true }])}>
                    Add approval rule
                </AdminButton>
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
