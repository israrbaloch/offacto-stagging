import { useForm } from '@inertiajs/react';
import Button from '../../../Components/Button';
import Input from '../../../Components/Input';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ company }) {
    const form = useForm({
        company_name: company.company_name || '',
        email: company.email || '',
        phone: company.phone || '',
        vat_number: company.vat_number || '',
        street: company.street || '',
        house: company.house || '',
        postal_code: company.postal_code || '',
        city: company.city || '',
    });

    return (
        <AdminLayout title={`Edit ${company.company_name}`}>
            <h1 className="mb-6 text-2xl font-semibold">Edit company</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.patch(`/admin/companies/${company.id}`);
                }}
                className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
            >
                <Input label="Company name" value={form.data.company_name} onChange={(e) => form.setData('company_name', e.target.value)} error={form.errors.company_name} />
                <Input label="Email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                <Input label="Phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                <Input label="VAT" value={form.data.vat_number} onChange={(e) => form.setData('vat_number', e.target.value)} />
                <Input label="Street" value={form.data.street} onChange={(e) => form.setData('street', e.target.value)} />
                <Input label="House" value={form.data.house} onChange={(e) => form.setData('house', e.target.value)} />
                <Input label="Postal code" value={form.data.postal_code} onChange={(e) => form.setData('postal_code', e.target.value)} />
                <Input label="City" value={form.data.city} onChange={(e) => form.setData('city', e.target.value)} />
                <Button type="submit" disabled={form.processing}>
                    Save
                </Button>
            </form>
        </AdminLayout>
    );
}
