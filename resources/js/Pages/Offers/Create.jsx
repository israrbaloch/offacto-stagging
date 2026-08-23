import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../../Components/Button';
import Input, { Select, TextArea } from '../../Components/Input';
import LineItemsEditor from '../../Components/LineItemsEditor';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { optionsFromMap } from '../../lib/utils';

export default function Create({
    customers = {},
    statuses = {},
    servicesData = [],
    defaultStatusId,
    vatRate = 21,
}) {
    const [items, setItems] = useState([]);
    const form = useForm({
        customer_id: '',
        offer_date: '',
        valid_until: '',
        intro: '',
        desc: '',
        notes: '',
        status: defaultStatusId || '',
    });

    return (
        <AuthenticatedLayout title="New offer">
            <h1 className="mb-6 text-2xl font-semibold">New offer</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.transform((data) => ({
                        ...data,
                        items: items.map((item) => ({
                            service_id: item.service_id,
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    }));
                    form.post('/offers');
                }}
                className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <Select label="Customer" value={form.data.customer_id} onChange={(e) => form.setData('customer_id', e.target.value)} options={optionsFromMap(customers)} placeholder="Select" error={form.errors.customer_id} />
                    <Select label="Status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} options={optionsFromMap(statuses)} placeholder="Select" error={form.errors.status} />
                    <Input label="Offer date" type="date" value={form.data.offer_date} onChange={(e) => form.setData('offer_date', e.target.value)} />
                    <Input label="Valid until" type="date" value={form.data.valid_until} onChange={(e) => form.setData('valid_until', e.target.value)} />
                </div>
                <TextArea label="Intro" value={form.data.intro} onChange={(e) => form.setData('intro', e.target.value)} error={form.errors.intro} rows={3} />
                <TextArea label="Description" value={form.data.desc} onChange={(e) => form.setData('desc', e.target.value)} error={form.errors.desc} rows={4} />
                <LineItemsEditor items={items} setItems={setItems} services={servicesData} vatRate={vatRate} error={form.errors.items} />
                <TextArea label="Notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={3} />
                <Button type="submit" disabled={form.processing}>
                    Create offer
                </Button>
            </form>
        </AuthenticatedLayout>
    );
}
