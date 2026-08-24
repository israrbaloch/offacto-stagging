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
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/companies');
                }}
                className="space-y-6"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link href="/companies" className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
                            <Icon name="back" className="h-4 w-4" />
                            Companies
                        </Link>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Add company</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {requireCompanyApproval
                                ? 'This company will be submitted for approval before it can send quotations.'
                                : 'Set up a workspace with contact and address details.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/companies" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            Save company
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card icon="building" title="Company details" hint="How this workspace appears on quotations.">
                        <div className="space-y-4">
                            <Field label="Company name" error={errors.company_name}>
                                <input className={fieldClass} value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} />
                            </Field>
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
                            <Field label="VAT / Tax number" error={errors.vat_number}>
                                <input className={fieldClass} value={data.vat_number} onChange={(e) => setData('vat_number', e.target.value)} />
                            </Field>
                            <Field label="Self-employed activity" error={errors.self_employed_activity}>
                                <SelectMenu
                                    value={data.self_employed_activity}
                                    onChange={(e) => setData('self_employed_activity', e.target.value)}
                                    placeholder="Optional"
                                    className={fieldClass}
                                    options={[
                                        { value: 'main_profession', label: 'Main profession' },
                                        { value: 'secondary_profession', label: 'Secondary profession' },
                                    ]}
                                />
                            </Field>
                        </div>
                    </Card>

                    <Card icon="building" title="Business address" hint="Used on PDFs, emails, and the public briefing.">
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                                <Field label="Street" error={errors.street}>
                                    <input className={fieldClass} value={data.street} onChange={(e) => setData('street', e.target.value)} />
                                </Field>
                                <Field label="House" error={errors.house}>
                                    <input className={fieldClass} value={data.house} onChange={(e) => setData('house', e.target.value)} />
                                </Field>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Postal code" error={errors.postal_code}>
                                    <input className={fieldClass} value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} />
                                </Field>
                                <Field label="City" error={errors.city}>
                                    <input className={fieldClass} value={data.city} onChange={(e) => setData('city', e.target.value)} />
                                </Field>
                            </div>
                            <Field label="Default language" error={errors.language}>
                                <SelectMenu
                                    value={data.language}
                                    onChange={(e) => setData('language', e.target.value)}
                                    options={optionsFromMap(languages)}
                                    placeholder="Select"
                                    className={fieldClass}
                                />
                            </Field>
                        </div>
                    </Card>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
