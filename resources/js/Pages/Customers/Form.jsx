import { Link, useForm } from '@inertiajs/react';
import Icon from '../../Components/Icon';
import SelectMenu from '../../Components/SelectMenu';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { optionsFromMap } from '../../lib/utils';

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

export default function Form({ customer = null, statuses = {}, countries = {}, defaultStatusId }) {
    const editing = Boolean(customer?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        first_name: customer?.first_name || '',
        surname: customer?.surname || '',
        type: customer?.type || 'individual',
        country_id: customer?.country_id || '',
        vat_number: customer?.vat_number || '',
        org_name: customer?.org_name || '',
        office_address: customer?.office_address || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        notes: customer?.notes || '',
        status: customer?.status || defaultStatusId || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            put(`/customers/${customer.id}`);
        } else {
            post('/customers');
        }
    };

    return (
        <AuthenticatedLayout title={editing ? 'Edit customer' : 'Add customer'}>
            <form onSubmit={submit} className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link href="/customers" className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
                            <Icon name="back" className="h-4 w-4" />
                            Customers
                        </Link>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            {editing ? 'Edit customer' : 'Add customer'}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {editing ? 'Update contact details used on quotations and invoices.' : 'Add a client you can send quotations and invoices to.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/customers" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </Link>
                        <button type="submit" disabled={processing} className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                            {editing ? 'Save changes' : 'Save customer'}
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card icon="customers" title="Contact" hint="Who we address on quotations.">
                        <div className="space-y-4">
                            <Field label="Customer type" error={errors.type}>
                                <SelectMenu
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    allowEmpty={false}
                                    className={fieldClass}
                                    options={[
                                        { value: 'individual', label: 'Individual' },
                                        { value: 'organization', label: 'Organization' },
                                    ]}
                                />
                            </Field>
                            {data.type === 'organization' && (
                                <Field label="Organization name" error={errors.org_name}>
                                    <input className={fieldClass} value={data.org_name} onChange={(e) => setData('org_name', e.target.value)} />
                                </Field>
                            )}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="First name" error={errors.first_name}>
                                    <input className={fieldClass} value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                                </Field>
                                <Field label="Surname" error={errors.surname}>
                                    <input className={fieldClass} value={data.surname} onChange={(e) => setData('surname', e.target.value)} />
                                </Field>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Email" error={errors.email}>
                                    <input type="email" className={fieldClass} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                </Field>
                                <Field label="Phone" error={errors.phone}>
                                    <input className={fieldClass} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    </Card>

                    <Card icon="building" title="Business details" hint="Billing address and status.">
                        <div className="space-y-4">
                            <Field label="Office address" error={errors.office_address}>
                                <textarea rows={3} className={fieldClass} value={data.office_address} onChange={(e) => setData('office_address', e.target.value)} />
                            </Field>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Country" error={errors.country_id}>
                                    <SelectMenu
                                        value={data.country_id}
                                        onChange={(e) => setData('country_id', e.target.value)}
                                        options={optionsFromMap(countries)}
                                        placeholder="Select"
                                        className={fieldClass}
                                    />
                                </Field>
                                <Field label="VAT / Tax number" error={errors.vat_number}>
                                    <input className={fieldClass} value={data.vat_number} onChange={(e) => setData('vat_number', e.target.value)} />
                                </Field>
                            </div>
                            <Field label="Status" error={errors.status}>
                                <SelectMenu
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    options={optionsFromMap(statuses)}
                                    placeholder="Select"
                                    className={fieldClass}
                                />
                            </Field>
                            <Field label="Notes" error={errors.notes}>
                                <textarea rows={4} className={fieldClass} value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                            </Field>
                        </div>
                    </Card>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
