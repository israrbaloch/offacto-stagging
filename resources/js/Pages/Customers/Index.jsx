import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../../Components/Button';
import Input, { Select, TextArea } from '../../Components/Input';
import Modal from '../../Components/Modal';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { customerName, optionsFromMap } from '../../lib/utils';

const empty = {
    first_name: '',
    surname: '',
    type: 'individual',
    country_id: '',
    vat_number: '',
    org_name: '',
    office_address: '',
    email: '',
    phone: '',
    notes: '',
    status: '',
};

export default function Index({ customers = [], statuses = {}, countries = {} }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, processing, errors, reset } = useForm(empty);

    const openCreate = () => {
        setEditing(null);
        reset();
        setData(empty);
        setOpen(true);
    };

    const openEdit = (customer) => {
        setEditing(customer);
        setData({
            first_name: customer.first_name || '',
            surname: customer.surname || '',
            type: customer.type || 'individual',
            country_id: customer.country_id || '',
            vat_number: customer.vat_number || '',
            org_name: customer.org_name || '',
            office_address: customer.office_address || '',
            email: customer.email || '',
            phone: customer.phone || '',
            notes: customer.notes || '',
            status: customer.status || '',
        });
        setOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            put(`/customers/${editing.id}`, { onSuccess: () => setOpen(false) });
        } else {
            post('/customers', { onSuccess: () => setOpen(false) });
        }
    };

    return (
        <AuthenticatedLayout title="Customers">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Customers</h1>
                <Button onClick={openCreate}>Add customer</Button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">{customerName(customer)}</td>
                                <td className="px-4 py-3">{customer.email}</td>
                                <td className="px-4 py-3">{customer.status_relation?.name || '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <Button variant="ghost" onClick={() => openEdit(customer)}>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            if (confirm('Delete this customer?')) {
                                                router.delete(`/customers/${customer.id}`);
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
                title={editing ? 'Edit customer' : 'Add customer'}
                onClose={() => setOpen(false)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="customer-form" disabled={processing}>
                            Save
                        </Button>
                    </>
                }
            >
                <form id="customer-form" onSubmit={submit} className="grid max-h-[70vh] gap-3 overflow-y-auto">
                    <Select label="Type" value={data.type} onChange={(e) => setData('type', e.target.value)} options={[{ value: 'individual', label: 'Individual' }, { value: 'organization', label: 'Organization' }]} error={errors.type} />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="First name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} error={errors.first_name} />
                        <Input label="Surname" value={data.surname} onChange={(e) => setData('surname', e.target.value)} error={errors.surname} />
                    </div>
                    {data.type === 'organization' && (
                        <Input label="Organization" value={data.org_name} onChange={(e) => setData('org_name', e.target.value)} error={errors.org_name} />
                    )}
                    <Input label="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                    <Input label="Phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                    <Select label="Country" value={data.country_id} onChange={(e) => setData('country_id', e.target.value)} options={optionsFromMap(countries)} placeholder="Select" error={errors.country_id} />
                    <Input label="VAT number" value={data.vat_number} onChange={(e) => setData('vat_number', e.target.value)} />
                    <Select label="Status" value={data.status} onChange={(e) => setData('status', e.target.value)} options={optionsFromMap(statuses)} placeholder="Select" error={errors.status} />
                    <TextArea label="Notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
