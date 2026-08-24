import { Link, useForm } from '@inertiajs/react';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

const fieldClass =
    'w-full rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className={labelClass}>{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
        </label>
    );
}

function Card({ icon, title, hint, children }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon name={icon} className="h-4 w-4" />
                </span>
                <div>
                    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                    {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

export default function Form({ service = null }) {
    const editing = Boolean(service?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        name: service?.name || '',
        description: service?.description || '',
        price: service?.price ?? '',
        unit: service?.unit || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            put(`/services/${service.id}`);
        } else {
            post('/services');
        }
    };

    return (
        <AuthenticatedLayout title={editing ? 'Edit service' : 'Add service'}>
            <form onSubmit={submit} className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link href="/services" className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
                            <Icon name="back" className="h-4 w-4" />
                            Services
                        </Link>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            {editing ? 'Edit service' : 'Add service'}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {editing ? 'Update how this line appears on quotations and invoices.' : 'Add a catalog item you can drop into quotations.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/services" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </Link>
                        <button type="submit" disabled={processing} className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                            {editing ? 'Save changes' : 'Save service'}
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card icon="wrench" title="Service details" hint="Name and description shown on quotes.">
                        <div className="space-y-4">
                            <Field label="Name" error={errors.name}>
                                <input className={fieldClass} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            </Field>
                            <Field label="Description" error={errors.description}>
                                <textarea rows={7} className={fieldClass} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            </Field>
                        </div>
                    </Card>
                    <Card icon="document" title="Pricing" hint="Default price and unit for line items.">
                        <div className="space-y-4">
                            <Field label="Price" error={errors.price}>
                                <input type="number" step="0.01" min="0" className={fieldClass} value={data.price} onChange={(e) => setData('price', e.target.value)} />
                            </Field>
                            <Field label="Unit" error={errors.unit}>
                                <input className={fieldClass} placeholder="hour, piece, project…" value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
                            </Field>
                        </div>
                    </Card>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
