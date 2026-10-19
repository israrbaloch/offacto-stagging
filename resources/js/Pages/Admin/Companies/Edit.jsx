import { useForm } from '@inertiajs/react';
import {
    AdminBody,
    AdminButton,
    AdminCard,
    AdminHeader,
    AdminLinkButton,
    AdminPage,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function AdminCompanyEdit({ profile, languages = [], activityOptions = [] }) {
    const form = useForm({
        company_name: profile.company_name,
        legal_name: profile.legal_name || '',
        first_name: profile.first_name,
        surname: profile.surname,
        email: profile.email,
        phone: profile.phone,
        vat_number: profile.vat_number,
        street: profile.street,
        house: profile.house,
        postal_code: profile.postal_code,
        city: profile.city,
        language: profile.language,
        self_employed_activity: profile.self_employed_activity || '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.patch(`/admin/companies/${profile.id}`);
    };

    return (
        <AdminLayout title={`Edit ${profile.company_name}`}>
            <AdminPage>
                <AdminHeader
                    eyebrow="Directory"
                    title="Edit company"
                    description="Legal identity, contacts, and business type."
                    backHref={`/admin/companies/${profile.id}`}
                    backLabel="Company details"
                />
                <AdminBody>
                    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
                        <AdminCard title="Business identity">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block text-sm sm:col-span-2">
                                    <span className="mb-1.5 block font-medium text-slate-700">Trading name</span>
                                    <input className={inputClass} value={form.data.company_name} onChange={(e) => form.setData('company_name', e.target.value)} />
                                </label>
                                <label className="block text-sm sm:col-span-2">
                                    <span className="mb-1.5 block font-medium text-slate-700">Legal name</span>
                                    <input className={inputClass} value={form.data.legal_name} onChange={(e) => form.setData('legal_name', e.target.value)} />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1.5 block font-medium text-slate-700">VAT number</span>
                                    <input className={inputClass} value={form.data.vat_number} onChange={(e) => form.setData('vat_number', e.target.value)} />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1.5 block font-medium text-slate-700">Business type</span>
                                    <select className={selectClass} value={form.data.self_employed_activity} onChange={(e) => form.setData('self_employed_activity', e.target.value)}>
                                        <option value="">—</option>
                                        {activityOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block text-sm sm:col-span-2">
                                    <span className="mb-1.5 block font-medium text-slate-700">Language</span>
                                    <select className={selectClass} value={form.data.language} onChange={(e) => form.setData('language', Number(e.target.value))}>
                                        {languages.map((lang) => (
                                            <option key={lang.id} value={lang.id}>
                                                {lang.name} ({lang.code})
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </AdminCard>

                        <AdminCard title="Contact & address">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block text-sm">
                                    <span className="mb-1.5 block font-medium text-slate-700">First name</span>
                                    <input className={inputClass} value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1.5 block font-medium text-slate-700">Surname</span>
                                    <input className={inputClass} value={form.data.surname} onChange={(e) => form.setData('surname', e.target.value)} />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1.5 block font-medium text-slate-700">Email</span>
                                    <input type="email" className={inputClass} value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1.5 block font-medium text-slate-700">Phone</span>
                                    <input className={inputClass} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                                </label>
                                <label className="block text-sm sm:col-span-2">
                                    <span className="mb-1.5 block font-medium text-slate-700">Street</span>
                                    <input className={inputClass} value={form.data.street} onChange={(e) => form.setData('street', e.target.value)} />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1.5 block font-medium text-slate-700">House no.</span>
                                    <input className={inputClass} value={form.data.house} onChange={(e) => form.setData('house', e.target.value)} />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1.5 block font-medium text-slate-700">Postal code</span>
                                    <input className={inputClass} value={form.data.postal_code} onChange={(e) => form.setData('postal_code', e.target.value)} />
                                </label>
                                <label className="block text-sm sm:col-span-2">
                                    <span className="mb-1.5 block font-medium text-slate-700">City</span>
                                    <input className={inputClass} value={form.data.city} onChange={(e) => form.setData('city', e.target.value)} />
                                </label>
                            </div>
                        </AdminCard>

                        <div className="flex gap-3">
                            <AdminButton type="submit" disabled={form.processing}>
                                Save changes
                            </AdminButton>
                            <AdminLinkButton href={`/admin/companies/${profile.id}`} variant="secondary">
                                Cancel
                            </AdminLinkButton>
                        </div>
                    </form>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
