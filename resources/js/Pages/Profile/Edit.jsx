import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Icon from '../../Components/Icon';
import SelectMenu from '../../Components/SelectMenu';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { optionsFromMap } from '../../lib/utils';

const fieldClass =
    'w-full rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

function addressValue(company) {
    const line1 = [company?.street, company?.house].filter(Boolean).join(' ');
    const line2 = [company?.postal_code, company?.city].filter(Boolean).join(' ');
    return [line1, line2].filter(Boolean).join('\n');
}

function parseAddress(text) {
    const lines = String(text || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    if (!lines.length) {
        return { street: '', house: '', postal_code: '', city: '' };
    }
    if (lines.length === 1) {
        return { street: lines[0], house: '', postal_code: '', city: '' };
    }
    const last = lines[lines.length - 1];
    const street = lines.slice(0, -1).join(', ');
    const match = last.match(/^(\S+)\s+(.+)$/);
    if (match) {
        return { street, house: '', postal_code: match[1], city: match[2] };
    }
    return { street, house: '', postal_code: '', city: last };
}

function Card({ icon, title, action, children, className = '' }) {
    return (
        <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Icon name={icon} className="h-4 w-4" />
                    </span>
                    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
        >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-5' : 'left-0.5'}`} />
        </button>
    );
}

export default function Edit({
    user,
    company,
    companySettings,
    invoiceLogoUrl,
    numberingSeries = {},
    languages = {},
    legalDocuments = [],
}) {
    const [addingLegal, setAddingLegal] = useState(false);
    const [logoPreview, setLogoPreview] = useState(invoiceLogoUrl || null);

    const profile = useForm({
        name: user?.name || '',
        email: user?.email || '',
    });
    const companyForm = useForm({
        company_name: company?.company_name || '',
        first_name: company?.first_name || '',
        surname: company?.surname || '',
        email: company?.email || '',
        phone: company?.phone || '',
        vat_number: company?.vat_number || '',
        street: company?.street || '',
        house: company?.house || '',
        postal_code: company?.postal_code || '',
        city: company?.city || '',
        language: company?.language || '',
        self_employed_activity: company?.self_employed_activity || '',
        address: addressValue(company),
    });
    const settings = useForm({
        numbering_series: companySettings?.numbering_series || Object.keys(numberingSeries)[0] || '',
        theme: {
            primary: companySettings?.theme?.primary || '#4054b2',
            secondary: companySettings?.theme?.secondary || '#94a3b8',
        },
        invoice_logo: null,
    });
    const destroy = useForm({ password: '' });

    const saveAccount = (e) => {
        e.preventDefault();
        profile.patch('/profile');
    };

    const saveCompany = (e) => {
        e.preventDefault();
        const parsed = parseAddress(companyForm.data.address);
        companyForm.transform((data) => ({
            ...data,
            street: parsed.street || data.street,
            house: parsed.house || data.house || '-',
            postal_code: parsed.postal_code || data.postal_code,
            city: parsed.city || data.city,
        }));
        companyForm.patch('/profile/company');
    };

    const saveBranding = (extra = {}) => {
        settings.transform((data) => ({ ...data, ...extra }));
        settings.patch('/profile/company-settings', { forceFormData: true });
    };

    const typeLabel = {
        terms: 'Terms of Service',
        contract: 'Contract',
        other: 'Other',
    };

    return (
        <AuthenticatedLayout title="Profile & Settings">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile & Settings</h1>
                <p className="mt-1 text-sm text-slate-500">Manage your account, company branding, and legal documents.</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.9fr)]">
                <div className="space-y-6">
                    <Card icon="user" title="Account Settings">
                        <form onSubmit={saveAccount} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className={labelClass}>Full Name</span>
                                    <input className={fieldClass} value={profile.data.name} onChange={(e) => profile.setData('name', e.target.value)} />
                                    {profile.errors.name && <span className="mt-1 block text-xs text-rose-600">{profile.errors.name}</span>}
                                </label>
                                <label className="block">
                                    <span className={labelClass}>Email Address</span>
                                    <input type="email" className={fieldClass} value={profile.data.email} onChange={(e) => profile.setData('email', e.target.value)} />
                                    {profile.errors.email && <span className="mt-1 block text-xs text-rose-600">{profile.errors.email}</span>}
                                </label>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <button type="submit" disabled={profile.processing} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                                    Save account
                                </button>
                            </div>
                            <div className="border-t border-slate-100 pt-5">
                                <h3 className="text-sm font-semibold text-slate-900">Password Reset</h3>
                                <p className="mt-1 text-sm text-slate-500">We will send a secure code to your email to reset your password.</p>
                                <button
                                    type="button"
                                    onClick={() => router.post('/profile/password-reset')}
                                    className="mt-3 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                                >
                                    Send Reset Link
                                </button>
                            </div>
                        </form>
                    </Card>

                    <Card icon="building" title="Company Information">
                        {company ? (
                            <form onSubmit={saveCompany} className="space-y-4">
                                <label className="block">
                                    <span className={labelClass}>Company Name</span>
                                    <input className={fieldClass} value={companyForm.data.company_name} onChange={(e) => companyForm.setData('company_name', e.target.value)} />
                                    {companyForm.errors.company_name && <span className="mt-1 block text-xs text-rose-600">{companyForm.errors.company_name}</span>}
                                </label>
                                <label className="block">
                                    <span className={labelClass}>Business Address</span>
                                    <textarea
                                        rows={3}
                                        className={fieldClass}
                                        value={companyForm.data.address}
                                        onChange={(e) => companyForm.setData('address', e.target.value)}
                                    />
                                </label>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block">
                                        <span className={labelClass}>VAT / Tax Number</span>
                                        <input className={fieldClass} value={companyForm.data.vat_number} onChange={(e) => companyForm.setData('vat_number', e.target.value)} />
                                    </label>
                                    <label className="block">
                                        <span className={labelClass}>Default Language</span>
                                        <SelectMenu
                                            value={companyForm.data.language}
                                            onChange={(e) => companyForm.setData('language', e.target.value)}
                                            options={optionsFromMap(languages)}
                                            placeholder="Select"
                                            className={fieldClass}
                                        />
                                    </label>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={companyForm.processing} className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                                        Save Company Details
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Create a company first to edit company details.{' '}
                                <a href="/companies/create" className="font-medium text-indigo-600">Add company</a>
                            </p>
                        )}
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card icon="palette" title="Branding">
                        <div className="space-y-5">
                            <div>
                                <span className={labelClass}>Company Logo</span>
                                <label className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-8 text-center hover:border-indigo-300 hover:bg-indigo-50">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Company logo" className="mb-3 max-h-16 w-auto object-contain" />
                                    ) : (
                                        <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-500 shadow-sm">
                                            <Icon name="upload" className="h-5 w-5" />
                                        </span>
                                    )}
                                    <span className="text-sm font-medium text-indigo-700">Click to upload</span>
                                    <span className="mt-1 text-xs text-slate-400">SVG, PNG, JPG (max 2MB)</span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setLogoPreview(URL.createObjectURL(file));
                                            settings.setData('invoice_logo', file);
                                            saveBranding({ invoice_logo: file });
                                        }}
                                    />
                                </label>
                            </div>
                            <div>
                                <span className={labelClass}>Theme Colors</span>
                                <div className="mt-2 space-y-3">
                                    {[
                                        { key: 'primary', label: 'Primary Color' },
                                        { key: 'secondary', label: 'Accent Color' },
                                    ].map((item) => (
                                        <label key={item.key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                                            <span className="text-sm text-slate-700">{item.label}</span>
                                            <span className="flex items-center gap-2">
                                                <span className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-white shadow">
                                                    <input
                                                        type="color"
                                                        className="h-10 w-10 -translate-x-1 -translate-y-1 cursor-pointer border-0 bg-transparent p-0"
                                                        value={settings.data.theme[item.key]}
                                                        onChange={(e) => settings.setData('theme', { ...settings.data.theme, [item.key]: e.target.value })}
                                                        onBlur={() => saveBranding()}
                                                    />
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card
                        icon="scale"
                        title="Legal Docs"
                        action={
                            company ? (
                                <button type="button" onClick={() => setAddingLegal((open) => !open)} className="text-indigo-600 hover:text-indigo-700" aria-label="Add legal document">
                                    <Icon name="plus" className="h-5 w-5" />
                                </button>
                            ) : null
                        }
                    >
                        {!company && <p className="text-sm text-slate-500">Add a company to upload legal documents.</p>}
                        <ul className="space-y-3">
                            {legalDocuments.map((doc) => (
                                <li key={doc.id} className="rounded-2xl bg-indigo-50/80 px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate font-medium text-slate-900">{typeLabel[doc.type] || doc.original_name}</div>
                                            <div className="mt-0.5 truncate text-xs text-slate-500">{doc.original_name}</div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Icon name="document" className="h-4 w-4 text-indigo-400" />
                                            <button type="button" className="hover:text-rose-600" onClick={() => router.delete(`/profile/legal-documents/${doc.id}`)} aria-label="Delete">
                                                <Icon name="trash" className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-600">Attach to quotes</span>
                                        <Toggle
                                            checked={!!doc.attach_to_quotes_default}
                                            onChange={(checked) => router.patch(`/profile/legal-documents/${doc.id}`, { attach_to_quotes_default: checked })}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {addingLegal && company && (
                            <form
                                className="mt-4 space-y-3 border-t border-slate-100 pt-4"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formEl = e.currentTarget;
                                    const data = new FormData(formEl);
                                    if (formEl.attach_to_quotes_default?.checked) {
                                        data.set('attach_to_quotes_default', '1');
                                    }
                                    router.post('/profile/legal-documents', data, {
                                        forceFormData: true,
                                        onSuccess: () => {
                                            formEl.reset();
                                            setAddingLegal(false);
                                        },
                                    });
                                }}
                            >
                                <select name="type" className={fieldClass} defaultValue="terms">
                                    <option value="terms">Terms</option>
                                    <option value="contract">Contract</option>
                                    <option value="other">Other</option>
                                </select>
                                <input name="file" type="file" accept="application/pdf" required className={fieldClass} />
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input type="checkbox" name="attach_to_quotes_default" value="1" defaultChecked />
                                    Attach to quotes by default
                                </label>
                                <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
                                    Upload PDF
                                </button>
                            </form>
                        )}
                    </Card>
                </div>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    destroy.delete('/profile');
                }}
                className="mt-6 flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h2 className="font-semibold text-rose-700">Danger Zone</h2>
                    <p className="mt-1 text-sm text-rose-600/80">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    <input
                        type="password"
                        placeholder="Confirm password"
                        className="mt-3 w-full max-w-xs rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm"
                        value={destroy.data.password}
                        onChange={(e) => destroy.setData('password', e.target.value)}
                    />
                    {destroy.errors.password && <span className="mt-1 block text-xs text-rose-600">{destroy.errors.password}</span>}
                </div>
                <button type="submit" disabled={destroy.processing} className="shrink-0 rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100">
                    Delete Account
                </button>
            </form>
        </AuthenticatedLayout>
    );
}
