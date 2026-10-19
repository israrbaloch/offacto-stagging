import AdminColorPicker from './AdminColorPicker';
import {
    AdminButton,
    AdminCheckboxField,
    AdminField,
    AdminSection,
    AdminTextButton,
    checkboxClass,
    inputClass,
    selectClass,
} from './ui';

const MENU_LABELS = {
    dashboard: 'Dashboard',
    customers: 'Customers',
    offers: 'Quotations',
    invoices: 'Invoices',
    briefings: 'Briefings',
};

const FEATURE_LABELS = {
    peppol: 'Peppol e-invoicing',
    postbode: 'Postbode postal sending',
    ai_briefings: 'AI-assisted briefings',
    recurring_invoices: 'Recurring invoices',
};

const PAYMENT_METHODS = [
    { id: 'bank_transfer', label: 'Bank transfer' },
    { id: 'mollie', label: 'Online payment (Mollie)' },
];

const EMAIL_TEMPLATE_LABELS = {
    verification: 'Email verification',
    password_reset: 'Password reset',
    offer_sent: 'Quotation sent',
    invoice_sent: 'Invoice sent',
    payment_reminder: 'Payment reminder',
    subscription_renewal: 'Subscription renewal',
    subscription_cancelled: 'Subscription cancelled',
};

const LOCKED_FIELD_OPTIONS = [
    { id: 'company_logo', label: 'Company logo' },
    { id: 'brand_colors', label: 'Brand colors' },
    { id: 'legal_name', label: 'Legal name' },
    { id: 'invoice_footer', label: 'Invoice footer text' },
];

function DocumentTemplateEditor({ title, value = {}, onChange }) {
    const v = { show_logo: true, header_align: 'left', footer_text: '', font_size: 'medium', ...value };
    const set = (patch) => onChange({ ...v, ...patch });

    return (
        <AdminSection title={title} className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <AdminCheckboxField label="Show logo on document" checked={!!v.show_logo} onChange={(e) => set({ show_logo: e.target.checked })} />
                <AdminField label="Header alignment">
                    <select className={selectClass} value={v.header_align} onChange={(e) => set({ header_align: e.target.value })}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </AdminField>
                <AdminField label="Text size">
                    <select className={selectClass} value={v.font_size} onChange={(e) => set({ font_size: e.target.value })}>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </AdminField>
                <AdminField label="Footer text (optional)" className="sm:col-span-2">
                    <textarea className={`${inputClass} min-h-[80px]`} value={v.footer_text || ''} onChange={(e) => set({ footer_text: e.target.value })} placeholder="Thank you for your business." />
                </AdminField>
            </div>
        </AdminSection>
    );
}

export default function SettingsStructuredField({ widget, field, value, onChange, locales = ['en', 'fr', 'nl'] }) {
    switch (widget) {
        case 'enabled_locales': {
            const selected = Array.isArray(value) ? value : locales;
            const toggle = (code) => {
                const next = selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code];
                onChange(next.length ? next : [code]);
            };
            return (
                <AdminSection title={field.label} description="Languages available to companies and public pages.">
                    <div className="flex flex-wrap gap-3">
                        {locales.map((code) => (
                            <label key={code} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm">
                                <input type="checkbox" className={checkboxClass} checked={selected.includes(code)} onChange={() => toggle(code)} />
                                {code.toUpperCase()}
                            </label>
                        ))}
                    </div>
                </AdminSection>
            );
        }
        case 'translation_overrides': {
            const overrides = value && typeof value === 'object' ? value : {};
            const locale = locales[0];
            const rows = Object.entries(overrides[locale] || {});
            const setLocaleRows = (nextRows) => {
                onChange({ ...overrides, [locale]: Object.fromEntries(nextRows.filter(([k]) => k.trim())) });
            };
            return (
                <AdminSection
                    title="Custom wording (optional)"
                    description="Override a few platform phrases in English. Leave blank to use built-in translations. More languages can be added later."
                >
                    <div className="space-y-2">
                        {rows.map(([k, v], i) => (
                            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                                <input className={inputClass} placeholder="Label key (e.g. common.save)" value={k} onChange={(e) => {
                                    const copy = [...rows];
                                    copy[i] = [e.target.value, v];
                                    setLocaleRows(copy);
                                }} />
                                <input className={inputClass} placeholder="Your text" value={v} onChange={(e) => {
                                    const copy = [...rows];
                                    copy[i] = [k, e.target.value];
                                    setLocaleRows(copy);
                                }} />
                                <AdminTextButton type="button" onClick={() => setLocaleRows(rows.filter((_, j) => j !== i))}>
                                    Remove
                                </AdminTextButton>
                            </div>
                        ))}
                        <AdminButton type="button" variant="secondary" onClick={() => setLocaleRows([...rows, ['', '']])}>
                            Add phrase
                        </AdminButton>
                    </div>
                </AdminSection>
            );
        }
        case 'tax_categories': {
            const rows = Array.isArray(value) ? value : [];
            const update = (next) => onChange(next);
            return (
                <AdminSection title="Tax categories" description="Rates used when new companies are created. Companies can adjust these later in their profile.">
                    <ul className="space-y-3">
                        {rows.map((row, i) => (
                            <li key={i} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_100px_auto]">
                                <input className={inputClass} placeholder="Name" value={row.name || ''} onChange={(e) => {
                                    const n = [...rows];
                                    n[i] = { ...n[i], name: e.target.value };
                                    update(n);
                                }} />
                                <input className={inputClass} placeholder="Code" value={row.code || ''} onChange={(e) => {
                                    const n = [...rows];
                                    n[i] = { ...n[i], code: e.target.value };
                                    update(n);
                                }} />
                                <input type="number" className={inputClass} placeholder="%" value={row.rate ?? ''} onChange={(e) => {
                                    const n = [...rows];
                                    n[i] = { ...n[i], rate: Number(e.target.value) };
                                    update(n);
                                }} />
                                <AdminTextButton type="button" onClick={() => update(rows.filter((_, j) => j !== i))}>
                                    Remove
                                </AdminTextButton>
                            </li>
                        ))}
                    </ul>
                    <AdminButton type="button" variant="secondary" className="mt-3" onClick={() => update([...rows, { name: '', code: '', rate: 0 }])}>
                        Add tax category
                    </AdminButton>
                </AdminSection>
            );
        }
        case 'document_template_offers':
            return <DocumentTemplateEditor title="Default quotation layout" value={value} onChange={onChange} />;
        case 'document_template_invoices':
            return <DocumentTemplateEditor title="Default invoice layout" value={value} onChange={onChange} />;
        case 'email_templates': {
            const templates = value && typeof value === 'object' ? value : {};
            const setOne = (id, patch) => onChange({ ...templates, [id]: { ...templates[id], ...patch } });
            return (
                <AdminSection title="Email templates" description="Edit subject lines and optional custom body text. Leave body empty to use the standard design.">
                    <div className="space-y-4">
                        {Object.entries(EMAIL_TEMPLATE_LABELS).map(([id, label]) => (
                            <div key={id} className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-sm font-semibold text-slate-900">{label}</p>
                                <AdminField label="Subject" className="mt-3">
                                    <input className={inputClass} value={templates[id]?.subject || ''} onChange={(e) => setOne(id, { subject: e.target.value })} />
                                </AdminField>
                                <AdminField label="Custom body (optional)" className="mt-2">
                                    <textarea className={`${inputClass} min-h-[72px]`} value={templates[id]?.body || ''} onChange={(e) => setOne(id, { body: e.target.value })} placeholder="Leave empty for default email layout." />
                                </AdminField>
                            </div>
                        ))}
                    </div>
                </AdminSection>
            );
        }
        case 'pdf_layout': {
            const v = { margin_top: 24, margin_bottom: 24, margin_left: 20, margin_right: 20, logo_position: 'top-left', legal_note: '', show_page_numbers: true, ...value };
            const set = (p) => onChange({ ...v, ...p });
            return (
                <AdminSection title="PDF page layout">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {['margin_top', 'margin_bottom', 'margin_left', 'margin_right'].map((k) => (
                            <AdminField key={k} label={k.replace('margin_', 'Margin ')}>
                                <input type="number" className={inputClass} value={v[k]} onChange={(e) => set({ [k]: Number(e.target.value) })} />
                            </AdminField>
                        ))}
                        <AdminField label="Logo position">
                            <select className={selectClass} value={v.logo_position} onChange={(e) => set({ logo_position: e.target.value })}>
                                <option value="top-left">Top left</option>
                                <option value="top-center">Top center</option>
                                <option value="top-right">Top right</option>
                            </select>
                        </AdminField>
                        <AdminCheckboxField label="Show page numbers" checked={!!v.show_page_numbers} onChange={(e) => set({ show_page_numbers: e.target.checked })} />
                        <AdminField label="Legal note in footer" className="sm:col-span-2">
                            <textarea className={`${inputClass} min-h-[80px]`} value={v.legal_note || ''} onChange={(e) => set({ legal_note: e.target.value })} />
                        </AdminField>
                    </div>
                </AdminSection>
            );
        }
        case 'numbering_defaults': {
            const v = { separator: '-', year_token: true, pad_width: 4, reset_policy: 'yearly', ...value };
            const set = (p) => onChange({ ...v, ...p });
            return (
                <AdminSection title="Advanced numbering" description="How reference numbers are built (e.g. OFF-2026-0001).">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <AdminField label="Separator between parts">
                            <select className={selectClass} value={v.separator} onChange={(e) => set({ separator: e.target.value })}>
                                <option value="-">Hyphen (-)</option>
                                <option value="/">Slash (/)</option>
                                <option value="">None</option>
                            </select>
                        </AdminField>
                        <AdminField label="Number padding (digits)">
                            <input type="number" min={1} max={8} className={inputClass} value={v.pad_width} onChange={(e) => set({ pad_width: Number(e.target.value) })} />
                        </AdminField>
                        <AdminCheckboxField label="Include year in number" checked={!!v.year_token} onChange={(e) => set({ year_token: e.target.checked })} />
                        <AdminField label="Reset counter">
                            <select className={selectClass} value={v.reset_policy} onChange={(e) => set({ reset_policy: e.target.value })}>
                                <option value="yearly">Every year</option>
                                <option value="never">Never (continuous)</option>
                            </select>
                        </AdminField>
                    </div>
                </AdminSection>
            );
        }
        case 'payment_methods': {
            const enabled = Array.isArray(value) ? value : [];
            const toggle = (id) => onChange(enabled.includes(id) ? enabled.filter((x) => x !== id) : [...enabled, id]);
            return (
                <AdminSection title="Payment methods offered by default">
                    <div className="space-y-2">
                        {PAYMENT_METHODS.map((m) => (
                            <AdminCheckboxField key={m.id} label={m.label} checked={enabled.includes(m.id)} onChange={() => toggle(m.id)} />
                        ))}
                    </div>
                </AdminSection>
            );
        }
        case 'copyright_templates': {
            const rows = Array.isArray(value) ? value : [];
            const update = (n) => onChange(n);
            return (
                <AdminSection title="Clause library" description="Reusable text blocks companies can insert into offers.">
                    {rows.map((row, i) => (
                        <div key={row.id || i} className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
                            <AdminField label="Title">
                                <input className={inputClass} value={row.title || ''} onChange={(e) => {
                                    const n = [...rows];
                                    n[i] = { ...n[i], title: e.target.value };
                                    update(n);
                                }} />
                            </AdminField>
                            <AdminField label="Clause text" className="mt-2">
                                <textarea className={`${inputClass} min-h-[100px]`} value={row.body || ''} onChange={(e) => {
                                    const n = [...rows];
                                    n[i] = { ...n[i], body: e.target.value };
                                    update(n);
                                }} />
                            </AdminField>
                        </div>
                    ))}
                </AdminSection>
            );
        }
        case 'legal_documents': {
            const rows = Array.isArray(value) ? value : [];
            const update = (n) => onChange(n);
            return (
                <AdminSection title="Legal documents" description="Links to terms, privacy notices, and whether to attach them automatically.">
                    {rows.map((row, i) => (
                        <div key={row.id || i} className="mb-3 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                            <AdminField label="Title">
                                <input className={inputClass} value={row.title || ''} onChange={(e) => {
                                    const n = [...rows];
                                    n[i] = { ...n[i], title: e.target.value };
                                    update(n);
                                }} />
                            </AdminField>
                            <AdminField label="Version">
                                <input className={inputClass} value={row.version || ''} onChange={(e) => {
                                    const n = [...rows];
                                    n[i] = { ...n[i], version: e.target.value };
                                    update(n);
                                }} />
                            </AdminField>
                            <AdminField label="Document URL" className="sm:col-span-2">
                                <input className={inputClass} value={row.url || ''} onChange={(e) => {
                                    const n = [...rows];
                                    n[i] = { ...n[i], url: e.target.value };
                                    update(n);
                                }} placeholder="https://…" />
                            </AdminField>
                            <AdminCheckboxField label="Attach automatically when relevant" checked={!!row.auto_attach} onChange={(e) => {
                                const n = [...rows];
                                n[i] = { ...n[i], auto_attach: e.target.checked };
                                update(n);
                            }} />
                        </div>
                    ))}
                </AdminSection>
            );
        }
        case 'navigation_menu': {
            const items = value?.items || [];
            const update = (nextItems) => onChange({ items: nextItems });
            return (
                <AdminSection title="Workspace menu" description="Show or hide main menu items and set their order (lower numbers appear first).">
                    <ul className="space-y-2">
                        {items.map((item, i) => (
                            <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                                <span className="min-w-[120px] text-sm font-medium">{MENU_LABELS[item.id] || item.id}</span>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" className={checkboxClass} checked={!!item.enabled} onChange={(e) => {
                                        const n = [...items];
                                        n[i] = { ...n[i], enabled: e.target.checked };
                                        update(n);
                                    }} />
                                    Visible
                                </label>
                                <AdminField label="Order" className="w-24">
                                    <input type="number" className={inputClass} value={item.order ?? i + 1} onChange={(e) => {
                                        const n = [...items];
                                        n[i] = { ...n[i], order: Number(e.target.value) };
                                        update(n);
                                    }} />
                                </AdminField>
                            </li>
                        ))}
                    </ul>
                </AdminSection>
            );
        }
        case 'feature_flags': {
            const flags = value && typeof value === 'object' ? value : {};
            const toggle = (key) => onChange({ ...flags, [key]: !flags[key] });
            return (
                <AdminSection title="Platform features" description="Turn integrations and modules on or off for everyone. Plan-specific rules are managed under Plans.">
                    <div className="space-y-2">
                        {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                            <AdminCheckboxField key={key} label={label} checked={!!flags[key]} onChange={() => toggle(key)} />
                        ))}
                    </div>
                </AdminSection>
            );
        }
        case 'branding_locked': {
            const locked = Array.isArray(value) ? value : [];
            const toggle = (id) => onChange(locked.includes(id) ? locked.filter((x) => x !== id) : [...locked, id]);
            return (
                <AdminSection title="Locked for companies" description="Selected items cannot be changed by company admins.">
                    <div className="space-y-2">
                        {LOCKED_FIELD_OPTIONS.map((opt) => (
                            <AdminCheckboxField key={opt.id} label={`Lock: ${opt.label}`} checked={locked.includes(opt.id)} onChange={() => toggle(opt.id)} />
                        ))}
                    </div>
                </AdminSection>
            );
        }
        case 'public_pages': {
            const pages = { briefing: {}, quotation: {}, ...value };
            const PageBlock = ({ id, title }) => {
                const p = pages[id] || {};
                const set = (patch) => onChange({ ...pages, [id]: { ...p, ...patch } });
                return (
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-900">{title}</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <AdminCheckboxField label="Show platform logo" checked={p.show_platform_logo !== false} onChange={(e) => set({ show_platform_logo: e.target.checked })} />
                            <AdminColorPicker label="Accent color" value={p.accent_color || '#0f172a'} onChange={(v) => set({ accent_color: v })} />
                        </div>
                    </div>
                );
            };
            return (
                <AdminSection title="Public pages">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <PageBlock id="briefing" title="Public briefing page" />
                        <PageBlock id="quotation" title="Public quotation page" />
                    </div>
                </AdminSection>
            );
        }
        case 'notification_defaults': {
            const n = value || { email: {}, in_app: {} };
            const setEmail = (key, val) => onChange({ ...n, email: { ...n.email, [key]: val } });
            const setInApp = (key, val) => onChange({ ...n, in_app: { ...n.in_app, [key]: val } });
            return (
                <AdminSection title="Default notifications" description="Initial preferences for new users before they customize their own.">
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Email</p>
                    <div className="mb-4 space-y-2">
                        <AdminCheckboxField label="When an invoice is sent" checked={!!n.email?.invoice_sent} onChange={(e) => setEmail('invoice_sent', e.target.checked)} />
                        <AdminCheckboxField label="When a quotation is sent" checked={!!n.email?.offer_sent} onChange={(e) => setEmail('offer_sent', e.target.checked)} />
                    </div>
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-400">In-app</p>
                    <AdminCheckboxField label="Mentions and assignments" checked={!!n.in_app?.mentions} onChange={(e) => setInApp('mentions', e.target.checked)} />
                </AdminSection>
            );
        }
        case 'dashboard_widgets': {
            const widgets = value || {};
            const ownerOptions = [
                { id: 'trial', label: 'Trial status' },
                { id: 'revenue', label: 'Revenue summary' },
                { id: 'pipeline', label: 'Sales pipeline' },
            ];
            const memberOptions = [
                { id: 'tasks', label: 'Tasks' },
                { id: 'recent_offers', label: 'Recent quotations' },
            ];
            const RoleBlock = ({ role, title, options }) => {
                const list = widgets[role] || [];
                const toggle = (id) => {
                    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
                    onChange({ ...widgets, [role]: next });
                };
                return (
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-semibold">{title}</p>
                        <div className="mt-2 space-y-2">
                            {options.map((o) => (
                                <AdminCheckboxField key={o.id} label={o.label} checked={list.includes(o.id)} onChange={() => toggle(o.id)} />
                            ))}
                        </div>
                    </div>
                );
            };
            return (
                <AdminSection title="Dashboard widgets">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <RoleBlock role="owner" title="Company owners" options={ownerOptions} />
                        <RoleBlock role="member" title="Team members" options={memberOptions} />
                    </div>
                </AdminSection>
            );
        }
        case 'custom_fields': {
            return (
                <AdminSection title="Custom fields" description="Extra fields on records are managed per area below. Start with simple text fields; advanced validation can be added later.">
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                        Custom field builder UI is coming next. For now, companies use standard fields. Contact your implementation partner if you need custom fields immediately.
                    </p>
                </AdminSection>
            );
        }
        case 'workflows_info':
        case 'forms_info':
            return (
                <AdminSection title={field.label}>
                    <p className="text-sm leading-relaxed text-slate-600">
                        {field.hint || 'Standard workflows and forms are active. Custom approval chains and extra registration questions will appear here when enabled for your platform.'}
                    </p>
                </AdminSection>
            );
        default:
            return (
                <p className="text-sm text-slate-500">
                    This setting is not available in the simplified editor yet. Please contact support if you need to change it.
                </p>
            );
    }
}
