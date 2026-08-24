import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import DatePicker from '../../Components/DatePicker';
import Icon from '../../Components/Icon';
import InvoicePreview from '../../Components/InvoicePreview';
import LineItemsEditor from '../../Components/LineItemsEditor';
import RichTextEditor from '../../Components/RichTextEditor';
import SelectMenu from '../../Components/SelectMenu';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { optionsFromMap } from '../../lib/utils';

const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-800';

function Section({ id, title, hint, open, onToggle, children }) {
    return (
        <section className="border-b border-slate-200 py-8 last:border-0">
            <button type="button" onClick={() => onToggle(id)} className="flex w-full items-start justify-between gap-4 text-left">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                    <p className="mt-1 text-sm text-slate-400">{hint}</p>
                </div>
                <Icon name="chevron" className={`mt-1 h-5 w-5 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="mt-6">{children}</div>}
        </section>
    );
}

function dateValue(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
}

function parseIntro(value = '') {
    const [first, ...rest] = String(value).split('\n\n');
    if (rest.length && first && first.length <= 120 && !first.includes('\n')) {
        return { title: first, intro: rest.join('\n\n') };
    }
    return { title: '', intro: value || '' };
}

function parseNotes(value = '') {
    let notes = String(value || '');
    let conditions = '';
    const condMatch = notes.match(/^Special conditions:\s*([\s\S]*)$/m);
    if (condMatch) {
        conditions = condMatch[1].trim();
        notes = notes.replace(condMatch[0], '').trim();
    }
    return { conditions, comments: notes };
}

export default function Create({
    invoice = null,
    customers = {},
    servicesData = [],
    defaultStatusId,
    existingItems = [],
    vatRate = 21,
    nextInvoiceNumber = '',
    customersData = [],
    ipTransferTypes = {},
}) {
    const { activeCompany } = usePage().props;
    const parsed = parseIntro(invoice?.intro || '');
    const parsedNotes = parseNotes(invoice?.notes || '');
    const ready = useRef(false);
    const [items, setItems] = useState(existingItems);
    const [open, setOpen] = useState({
        basic: true,
        assignment: true,
        lines: true,
        copyright: true,
        comments: true,
    });
    const [previewOpen, setPreviewOpen] = useState(false);
    const [savedAt, setSavedAt] = useState(invoice?.updated_at || null);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState(parsed.title);
    const [conditions, setConditions] = useState(parsedNotes.conditions);
    const [infoOpen, setInfoOpen] = useState(true);

    const form = useForm({
        customer_id: invoice?.customer_id || '',
        offer_id: invoice?.offer_id || '',
        invoice_date: dateValue(invoice?.invoice_date) || new Date().toISOString().slice(0, 10),
        due_date: dateValue(invoice?.due_date),
        intro: parsed.intro,
        desc: invoice?.desc || '',
        notes: parsedNotes.comments,
        status: invoice?.status || defaultStatusId || '',
        ip_transfer_type: invoice?.ip_transfer_type || '',
    });

    const payloadFromState = () => ({
        customer_id: form.data.customer_id || null,
        offer_id: form.data.offer_id || null,
        invoice_date: form.data.invoice_date || null,
        due_date: form.data.due_date || null,
        intro: title ? `${title}\n\n${form.data.intro || ''}`.trim() : form.data.intro,
        desc: form.data.desc,
        notes: [conditions && `Special conditions: ${conditions}`, form.data.notes].filter(Boolean).join('\n\n'),
        status: form.data.status,
        ip_transfer_type: form.data.ip_transfer_type || null,
        items: items
            .filter((item) => item.service_id)
            .map((item) => ({
                service_id: item.service_id,
                description: item.description,
                quantity: item.kind === 'text' ? 1 : item.quantity,
                price: item.kind === 'text' ? 0 : item.price,
            })),
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            ready.current = true;
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!invoice?.id || !ready.current) return;
        const timer = setTimeout(() => {
            setSaving(true);
            form.transform(() => ({ ...payloadFromState(), autosave: true }));
            form.put(`/invoices/${invoice.id}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSavedAt(new Date().toISOString()),
                onFinish: () => setSaving(false),
            });
        }, 1500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data, items, title, conditions, invoice?.id]);

    const customerOptions = optionsFromMap(customers);
    const selectedCustomer = customersData.find((item) => String(item.id) === String(form.data.customer_id));
    const isSent = ['sent', 'paid'].includes(String(invoice?.status_relation?.name || '').toLowerCase())
        || invoice?.payment_status === 'paid';
    const copyrightLabel = ipTransferTypes[form.data.ip_transfer_type] || '';

    const submit = (e) => {
        e.preventDefault();
        if (!invoice?.id) return;
        form.transform(() => payloadFromState());
        form.put(`/invoices/${invoice.id}`);
    };

    const savedLabel = saving
        ? 'Saving draft…'
        : savedAt
            ? `Draft saved ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Draft created';

    return (
        <AuthenticatedLayout title="New invoice">
            <form onSubmit={submit}>
                <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur lg:-mx-8 lg:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/invoices" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100" aria-label="Back">
                                <Icon name="back" className="h-4 w-4" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Invoice details</h1>
                                <p className="text-xs text-slate-400">{invoice?.invoice_number || nextInvoiceNumber || 'New invoice'}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-slate-500 ring-1 ring-slate-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {savedLabel}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPreviewOpen(true)}
                                className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                            >
                                Preview invoice
                            </button>
                            {isSent && invoice?.id && (
                                <a
                                    href={`/invoices/${invoice.id}/download`}
                                    className="rounded-full border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                                >
                                    Download PDF
                                </a>
                            )}
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                                Save invoice
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white px-5 sm:px-8">
                    <Section
                        id="basic"
                        title="Basic information"
                        hint="All basic information of your invoice."
                        open={open.basic}
                        onToggle={(id) => setOpen((value) => ({ ...value, [id]: !value[id] }))}
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="block">
                                <span className={labelClass}>Title</span>
                                <input className={fieldClass} placeholder="Website redesign invoice" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </label>
                            <label className="block">
                                <span className={labelClass}>Invoice number</span>
                                <input className={`${fieldClass} bg-slate-50`} value={invoice?.invoice_number || nextInvoiceNumber} readOnly />
                            </label>
                            <label className="block">
                                <span className={labelClass}>Customer</span>
                                <SelectMenu
                                    className={fieldClass}
                                    value={form.data.customer_id}
                                    onChange={(e) => form.setData('customer_id', e.target.value)}
                                    options={customerOptions}
                                    placeholder="Select a customer"
                                    error={form.errors.customer_id}
                                />
                                {form.errors.customer_id && <span className="mt-1 block text-xs text-rose-600">{form.errors.customer_id}</span>}
                            </label>
                            <label className="block">
                                <span className={labelClass}>Due date</span>
                                <DatePicker className={fieldClass} value={form.data.due_date} onChange={(e) => form.setData('due_date', e.target.value)} />
                            </label>
                            <label className="block">
                                <span className={labelClass}>Invoice date</span>
                                <DatePicker className={fieldClass} value={form.data.invoice_date} onChange={(e) => form.setData('invoice_date', e.target.value)} />
                            </label>
                            <label className="block">
                                <span className={labelClass}>Trade name</span>
                                <input className={`${fieldClass} bg-slate-50`} value={activeCompany?.company_name || 'Your company'} readOnly />
                            </label>
                        </div>
                    </Section>

                    <Section
                        id="assignment"
                        title="Assignment"
                        hint="Briefly describe what this invoice covers."
                        open={open.assignment}
                        onToggle={(id) => setOpen((value) => ({ ...value, [id]: !value[id] }))}
                    >
                        <div className="grid gap-5 lg:grid-cols-2">
                            <div>
                                <span className={labelClass}>Introduction</span>
                                <RichTextEditor
                                    value={form.data.intro}
                                    onChange={(html) => form.setData('intro', html)}
                                    placeholder="A short opening your client will read first."
                                    error={form.errors.intro}
                                />
                                {form.errors.intro && <span className="mt-1 block text-xs text-rose-600">{form.errors.intro}</span>}
                            </div>
                            <div>
                                <span className={labelClass}>Description</span>
                                <RichTextEditor
                                    value={form.data.desc}
                                    onChange={(html) => form.setData('desc', html)}
                                    placeholder="Scope, deliverables, and anything the client should know."
                                    error={form.errors.desc}
                                />
                                {form.errors.desc && <span className="mt-1 block text-xs text-rose-600">{form.errors.desc}</span>}
                            </div>
                        </div>
                    </Section>

                    <Section
                        id="lines"
                        title="Invoice lines"
                        hint="List the products and services included on this invoice."
                        open={open.lines}
                        onToggle={(id) => setOpen((value) => ({ ...value, [id]: !value[id] }))}
                    >
                        {infoOpen && (
                            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-slate-600">
                                <span className="mt-0.5 font-semibold text-indigo-600">i</span>
                                <p className="flex-1">
                                    Pick a saved service for priced lines, or add a free-text note for context. Totals update as you type.
                                </p>
                                <button type="button" onClick={() => setInfoOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-600" aria-label="Dismiss">
                                    <Icon name="close" className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        <LineItemsEditor items={items} setItems={setItems} services={servicesData} vatRate={vatRate} error={form.errors.items} />
                    </Section>

                    <Section
                        id="copyright"
                        title="Copyright"
                        hint="Choose how you assign rights for this work."
                        open={open.copyright}
                        onToggle={(id) => setOpen((value) => ({ ...value, [id]: !value[id] }))}
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="block">
                                <span className={labelClass}>Agreements regarding copyright</span>
                                <SelectMenu
                                    className={fieldClass}
                                    value={form.data.ip_transfer_type}
                                    onChange={(e) => form.setData('ip_transfer_type', e.target.value)}
                                    placeholder="Select a regime"
                                    options={Object.entries(ipTransferTypes).map(([value, label]) => ({ value, label }))}
                                />
                            </label>
                            <label className="block">
                                <span className={labelClass}>
                                    Special conditions <span className="font-normal text-slate-400">(optional)</span>
                                </span>
                                <textarea
                                    className={fieldClass}
                                    rows={4}
                                    placeholder="Enter any special conditions here."
                                    value={conditions}
                                    onChange={(e) => setConditions(e.target.value)}
                                />
                            </label>
                        </div>
                    </Section>

                    <Section
                        id="comments"
                        title="Comments"
                        hint="Internal or client-facing remarks shown on the invoice."
                        open={open.comments}
                        onToggle={(id) => setOpen((value) => ({ ...value, [id]: !value[id] }))}
                    >
                        <div>
                            <span className={labelClass}>Comments</span>
                            <RichTextEditor
                                value={form.data.notes}
                                onChange={(html) => form.setData('notes', html)}
                                placeholder="Add comments that should appear on this invoice."
                                minHeight="10rem"
                            />
                        </div>
                    </Section>
                </div>
            </form>

            {previewOpen && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-100 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
                            <div>
                                <div className="text-sm font-semibold text-slate-900">Invoice preview</div>
                                <div className="text-xs text-slate-400">Live preview of the invoice</div>
                            </div>
                            <button type="button" onClick={() => setPreviewOpen(false)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50" aria-label="Close preview">
                                <Icon name="close" className="h-4 w-4" />
                                Close
                            </button>
                        </div>
                        <div className="overflow-auto p-4 sm:p-6">
                            <div className="mx-auto max-w-3xl overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-slate-200">
                                <InvoicePreview
                                    number={invoice?.invoice_number || nextInvoiceNumber}
                                    date={form.data.invoice_date}
                                    dueDate={form.data.due_date}
                                    offerNumber={invoice?.offer?.offer_number}
                                    from={{
                                        name: activeCompany?.company_name,
                                        street: activeCompany?.street,
                                        house: activeCompany?.house,
                                        postal_code: activeCompany?.postal_code,
                                        city: activeCompany?.city,
                                        email: activeCompany?.email,
                                    }}
                                    to={{
                                        name: selectedCustomer?.org_name || [selectedCustomer?.first_name, selectedCustomer?.surname].filter(Boolean).join(' '),
                                        org: selectedCustomer?.org_name
                                            ? [selectedCustomer.first_name, selectedCustomer.surname].filter(Boolean).join(' ')
                                            : '',
                                        address: selectedCustomer?.office_address,
                                        email: selectedCustomer?.email,
                                    }}
                                    intro={form.data.intro}
                                    desc={form.data.desc}
                                    items={items}
                                    comments={[conditions && `Special conditions: ${conditions}`, form.data.notes].filter(Boolean).join('\n\n')}
                                    copyrightLabel={copyrightLabel}
                                    vatRate={vatRate}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
