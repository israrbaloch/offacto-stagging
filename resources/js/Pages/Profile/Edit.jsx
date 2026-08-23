import { router, useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import Input, { Select } from '../../Components/Input';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { optionsFromMap } from '../../lib/utils';

export default function Edit({ user, company, companySettings, numberingSeries = {}, languages = {} }) {
    const profile = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
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
    });
    const settings = useForm({
        numbering_series: companySettings?.numbering_series || '',
        theme: {
            primary: companySettings?.theme?.primary || '',
            secondary: companySettings?.theme?.secondary || '',
        },
        invoice_logo: null,
    });
    const destroy = useForm({ password: '' });

    return (
        <AuthenticatedLayout title="Profile">
            <h1 className="mb-6 text-2xl font-semibold">Profile</h1>
            <div className="space-y-6">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        profile.patch('/profile');
                    }}
                    className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
                >
                    <h2 className="font-semibold">Account</h2>
                    <Input label="Name" value={profile.data.name} onChange={(e) => profile.setData('name', e.target.value)} error={profile.errors.name} />
                    <Input label="Email" type="email" value={profile.data.email} onChange={(e) => profile.setData('email', e.target.value)} error={profile.errors.email} />
                    <Input label="New password" type="password" value={profile.data.password} onChange={(e) => profile.setData('password', e.target.value)} error={profile.errors.password} />
                    <Input label="Confirm password" type="password" value={profile.data.password_confirmation} onChange={(e) => profile.setData('password_confirmation', e.target.value)} />
                    <Button type="submit" disabled={profile.processing}>
                        Save profile
                    </Button>
                </form>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        companyForm.patch('/profile/company');
                    }}
                    className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
                >
                    <h2 className="font-semibold">Company</h2>
                    <Input label="Company name" value={companyForm.data.company_name} onChange={(e) => companyForm.setData('company_name', e.target.value)} error={companyForm.errors.company_name} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First name" value={companyForm.data.first_name} onChange={(e) => companyForm.setData('first_name', e.target.value)} />
                        <Input label="Surname" value={companyForm.data.surname} onChange={(e) => companyForm.setData('surname', e.target.value)} />
                    </div>
                    <Input label="Email" type="email" value={companyForm.data.email} onChange={(e) => companyForm.setData('email', e.target.value)} error={companyForm.errors.email} />
                    <Input label="Phone" value={companyForm.data.phone} onChange={(e) => companyForm.setData('phone', e.target.value)} />
                    <Input label="VAT number" value={companyForm.data.vat_number} onChange={(e) => companyForm.setData('vat_number', e.target.value)} />
                    <Select label="Language" value={companyForm.data.language} onChange={(e) => companyForm.setData('language', e.target.value)} options={optionsFromMap(languages)} placeholder="Select" />
                    <Button type="submit" disabled={companyForm.processing}>
                        Save company
                    </Button>
                </form>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        settings.patch('/profile/company-settings', { forceFormData: true });
                    }}
                    className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
                >
                    <h2 className="font-semibold">Company settings</h2>
                    <Select
                        label="Numbering series"
                        value={settings.data.numbering_series}
                        onChange={(e) => settings.setData('numbering_series', e.target.value)}
                        options={optionsFromMap(numberingSeries)}
                        placeholder="Select"
                        error={settings.errors.numbering_series}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Primary color" type="color" value={settings.data.theme.primary || '#4f46e5'} onChange={(e) => settings.setData('theme', { ...settings.data.theme, primary: e.target.value })} />
                        <Input label="Secondary color" type="color" value={settings.data.theme.secondary || '#0f172a'} onChange={(e) => settings.setData('theme', { ...settings.data.theme, secondary: e.target.value })} />
                    </div>
                    <Input label="Invoice logo" type="file" onChange={(e) => settings.setData('invoice_logo', e.target.files[0])} />
                    <Button type="submit" disabled={settings.processing}>
                        Save settings
                    </Button>
                </form>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        destroy.delete('/profile');
                    }}
                    className="max-w-2xl space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-6"
                >
                    <h2 className="font-semibold text-rose-700">Delete account</h2>
                    <Input label="Confirm password" type="password" value={destroy.data.password} onChange={(e) => destroy.setData('password', e.target.value)} error={destroy.errors.password} />
                    <Button type="submit" variant="danger" disabled={destroy.processing}>
                        Delete account
                    </Button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
