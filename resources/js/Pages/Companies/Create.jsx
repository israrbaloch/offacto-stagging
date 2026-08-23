import { useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import Input, { Select } from '../../Components/Input';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { optionsFromMap } from '../../lib/utils';

export default function Create({ languages = {}, requireCompanyApproval }) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        first_name: '',
        surname: '',
        email: '',
        phone: '',
        vat_number: '',
        street: '',
        house: '',
        postal_code: '',
        city: '',
        language: '',
        self_employed_activity: '',
    });

    return (
        <AuthenticatedLayout title="Add company">
            <h1 className="mb-6 text-2xl font-semibold">Add company</h1>
            {requireCompanyApproval && <p className="mb-4 text-sm text-slate-500">This company will be submitted for approval.</p>}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/companies');
                }}
                className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
            >
                <Input label="Company name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} error={errors.company_name} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="First name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} error={errors.first_name} />
                    <Input label="Surname" value={data.surname} onChange={(e) => setData('surname', e.target.value)} error={errors.surname} />
                </div>
                <Input label="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <Input label="Phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} />
                <Input label="VAT number" value={data.vat_number} onChange={(e) => setData('vat_number', e.target.value)} />
                <div className="grid grid-cols-3 gap-4">
                    <Input className="col-span-2" label="Street" value={data.street} onChange={(e) => setData('street', e.target.value)} error={errors.street} />
                    <Input label="House" value={data.house} onChange={(e) => setData('house', e.target.value)} error={errors.house} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Postal code" value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} error={errors.postal_code} />
                    <Input label="City" value={data.city} onChange={(e) => setData('city', e.target.value)} error={errors.city} />
                </div>
                <Select label="Language" value={data.language} onChange={(e) => setData('language', e.target.value)} options={optionsFromMap(languages)} placeholder="Select" error={errors.language} />
                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        Save
                    </Button>
                    <Button href="/companies" variant="secondary">
                        Cancel
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
