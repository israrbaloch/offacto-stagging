import SettingsStructuredField from './SettingsStructuredField';
import { AdminField, AdminSection, inputClass } from './ui';

export default function IntegrationSettingsStructuredField(props) {
    const { widget, field, value, onChange } = props;

    if (widget === 'peppol_formats') {
        const formats = value && typeof value === 'object' ? value : {};
        const items = [
            { id: 'ubl_bis3', label: 'Peppol BIS Billing 3.0 (UBL)' },
            { id: 'cen16931', label: 'EN 16931 compliant' },
        ];
        return (
            <AdminSection title={field.label}>
                {items.map(({ id, label }) => (
                    <label key={id} className="mb-2 flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!formats[id]} onChange={(e) => onChange({ ...formats, [id]: e.target.checked })} />
                        {label}
                    </label>
                ))}
            </AdminSection>
        );
    }

    if (widget === 'whatsapp_templates') {
        const templates = value && typeof value === 'object' ? value : {};
        const keys = ['invoice', 'quotation'];
        return (
            <AdminSection title={field.label} description="User-initiated share only — placeholders: {{number}}, {{company}}, {{link}}">
                {keys.map((key) => (
                    <AdminField key={key} label={key}>
                        <textarea
                            className={`${inputClass} min-h-[72px]`}
                            value={templates[key] || ''}
                            onChange={(e) => onChange({ ...templates, [key]: e.target.value })}
                        />
                    </AdminField>
                ))}
            </AdminSection>
        );
    }

    if (widget === 'retry_policies') {
        const policies = value && typeof value === 'object' ? value : {};
        const providers = Object.keys(policies);
        const set = (provider, key, val) => {
            onChange({
                ...policies,
                [provider]: { ...(policies[provider] || {}), [key]: val },
            });
        };
        return (
            <AdminSection title={field.label}>
                {providers.map((provider) => (
                    <div key={provider} className="mb-3 grid gap-2 rounded-xl border border-slate-200/70 p-4 sm:grid-cols-2">
                        <p className="sm:col-span-2 text-sm font-medium capitalize">{provider.replace(/_/g, ' ')}</p>
                        <AdminField label="Max retries">
                            <input type="number" className={inputClass} value={policies[provider]?.max ?? 3} onChange={(e) => set(provider, 'max', Number(e.target.value))} />
                        </AdminField>
                        <AdminField label="Backoff (minutes)">
                            <input type="number" className={inputClass} value={policies[provider]?.backoff_minutes ?? 15} onChange={(e) => set(provider, 'backoff_minutes', Number(e.target.value))} />
                        </AdminField>
                    </div>
                ))}
            </AdminSection>
        );
    }

    return <SettingsStructuredField {...props} />;
}
