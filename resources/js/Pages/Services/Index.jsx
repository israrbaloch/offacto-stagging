import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../../Components/Button';
import Input, { TextArea } from '../../Components/Input';
import Modal from '../../Components/Modal';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { money } from '../../lib/utils';

const empty = { name: '', description: '', price: '', unit: '' };

export default function Index({ services = [] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, processing, errors, reset } = useForm(empty);

    const openCreate = () => {
        setEditing(null);
        reset();
        setData(empty);
        setOpen(true);
    };

    const openEdit = (service) => {
        setEditing(service);
        setData({
            name: service.name || '',
            description: service.description || '',
            price: service.price || '',
            unit: service.unit || '',
        });
        setOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            put(`/services/${editing.id}`, { onSuccess: () => setOpen(false) });
        } else {
            post('/services', { onSuccess: () => setOpen(false) });
        }
    };

    return (
        <AuthenticatedLayout title="Services">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Services</h1>
                <Button onClick={openCreate}>Add service</Button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">{service.name}</td>
                                <td className="px-4 py-3">{money(service.price)}</td>
                                <td className="px-4 py-3">{service.status_relation?.name || '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <Button variant="ghost" onClick={() => openEdit(service)}>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            if (confirm('Delete this service?')) {
                                                router.delete(`/services/${service.id}`);
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal
                open={open}
                title={editing ? 'Edit service' : 'Add service'}
                onClose={() => setOpen(false)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="service-form" disabled={processing}>
                            Save
                        </Button>
                    </>
                }
            >
                <form id="service-form" onSubmit={submit} className="space-y-3">
                    <Input label="Name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} />
                    <TextArea label="Description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                    <Input label="Price" type="number" step="0.01" value={data.price} onChange={(e) => setData('price', e.target.value)} error={errors.price} />
                    <Input label="Unit" value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
