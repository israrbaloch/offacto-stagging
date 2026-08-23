import { useForm } from '@inertiajs/react';
import Button from '../../../Components/Button';
import Input, { Select, TextArea } from '../../../Components/Input';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ service, statuses = [] }) {
    const options = Array.isArray(statuses)
        ? statuses.map((s) => ({ value: String(s.id), label: s.name }))
        : Object.entries(statuses).map(([value, label]) => ({ value: String(value), label: String(label) }));

    const form = useForm({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        unit: service.unit || '',
        status: service.status || '',
    });

    return (
        <AdminLayout title={`Edit ${service.name}`}>
            <h1 className="mb-6 text-2xl font-semibold">Edit service</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.patch(`/admin/services/${service.id}`);
                }}
                className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
            >
                <Input label="Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} />
                <TextArea label="Description" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                <Input label="Price" type="number" step="0.01" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} />
                <Input label="Unit" value={form.data.unit} onChange={(e) => form.setData('unit', e.target.value)} />
                <Select label="Status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} options={options} placeholder="Select" />
                <Button type="submit" disabled={form.processing}>
                    Save
                </Button>
            </form>
        </AdminLayout>
    );
}
