import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import DatePicker from '../../Components/DatePicker';
import Icon from '../../Components/Icon';
import LineItemsEditor from '../../Components/LineItemsEditor';
import OfferPreview from '../../Components/OfferPreview';
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
    let copyright = '';
    let conditions = '';
    const copyMatch = notes.match(/^Copyright:\s*(.+)$/m);
    if (copyMatch) {
        copyright = copyMatch[1].trim();
        notes = notes.replace(copyMatch[0], '').trim();
    }
    const condMatch = notes.match(/^Special conditions:\s*([\s\S]*)$/m);
    if (condMatch) {
        conditions = condMatch[1].trim();
        notes = notes.replace(condMatch[0], '').trim();
    }
    return { copyright, conditions, notes };
}

export default function Create({
    offer = null,
    customers = {},
    servicesData = [],
    defaultStatusId,
    existingItems = [],
    vatRate = 21,
    nextOfferNumber = '',
    customersData = [],
}) {
    const { activeCompany } = usePage().props;
    const parsed = parseIntro(offer?.intro || '');
    const parsedNotes = parseNotes(offer?.notes || '');
    const ready = useRef(false);
    const [items, setItems] = useState(existingItems);
    const [open, setOpen] = useState({
        basic: true,
        assignment: true,
        lines: true,
        copyright: true,
        email: false,
    });
    const [previewOpen, setPreviewOpen] = useState(false);
    const [savedAt, setSavedAt] = useState(offer?.updated_at || null);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState(parsed.title);
    const [copyright, setCopyright] = useState(parsedNotes.copyright);
    const [conditions, setConditions] = useState(parsedNotes.conditions);
    const [emailMessage, setEmailMessage] = useState(
        'Hi #CLIENTNAME#,\n\n#COMPANY# has prepared an offer for you. Please review it here: #OFFERLINK#.\n\nOnce you approve, we can get started.\n\nBest regards,\n#COMPANY#',
    );
    const [attachmentName, setAttachmentName] = useState('');
    const [infoOpen, setInfoOpen] = useState(true);

    const form = useForm({
        customer_id: offer?.customer_id || '',
        offer_date: dateValue(offer?.offer_date) || new Date().toISOString().slice(0, 10),
        valid_until: dateValue(offer?.valid_until),
        intro: parsed.intro,
        desc: offer?.desc || '',
        notes: parsedNotes.notes,
        status: offer?.status || defaultStatusId || '',
    });

    const payloadFromState = () => ({
        customer_id: form.data.customer_id || null,
        offer_date: form.data.offer_date || null,
        valid_until: form.data.valid_until || null,
        intro: title ? `${title}\n\n${form.data.intro || ''}`.trim() : form.data.intro,
        desc: form.data.desc,
        notes: [copyright && `Copyright: ${copyright}`, conditions && `Special conditions: ${conditions}`, form.data.notes]
            .filter(Boolean)
            .join('\n\n'),
        status: form.data.status,
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
        const timer = setTimeout(() => ready.current = true, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!offer?.id || !ready.current) return;
        const timer = setTimeout(() => {
            setSaving(true);
            form.transform(() => ({ ...payloadFromState(), autosave: true }));
            form.put(`/offers/${offer.id}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSavedAt(new Date().toISOString()),
                onFinish: () => setSaving(false),
            });
        }, 1500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data, items, title, copyright, conditions, offer?.id]);

    const customerOptions = optionsFromMap(customers);
    const selectedCustomer = customersData.find((item) => String(item.id) === String(form.data.customer_id));
    const isSent = ['sent', 'accepted', 'invoiced'].includes(String(offer?.status_relation?.name || '').toLowerCase());

    const submit = (e) => {
        e.preventDefault();
        if (!offer?.id) return;
        form.transform(() => payloadFromState());
        form.put(`/offers/${offer.id}`);
    };

    const savedLabel = saving
        ? 'Saving draft…'
        : savedAt
            ? `Draft saved ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Draft created';

    return (
        <AuthenticatedLayout title="New offer">
            <form onSubmit={submit}>
                <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur lg:-mx-8 lg:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/offers" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100" aria-label="Back">
                                <Icon name="back" className="h-4 w-4" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Offer details</h1>
                                <p className="text-xs text-slate-400">{offer?.offer_number || nextOfferNumber || 'New quotation'}</p>
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
                                Preview offer
                            </button>
                            {isSent && (
                                <a
                                    href={`/offers/${offer.id}/download`}
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
                                Send quote
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white px-5 sm:px-8">
                    <Section
                        id="basic"
                        title="Basic information"
                        hint="All basic information of your quote."
                        open={open.basic}
                        onToggle={(id) => setOpen((value) => ({ ...value, [id]: !value[id] }))}
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="block">
                                <span className={labelClass}>Title</span>
                                <input className={fieldClass} placeholder="Website redesign proposal" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </label>
                            <label className="block">
                                <span className={labelClass}>Offer number</span>
                                <input className={`${fieldClass} bg-slate-50`} value={nextOfferNumber} readOnly />
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
                                <span className={labelClass}>Quote expiration date</span>
                                <DatePicker className={fieldClass} value={form.data.valid_until} onChange={(e) => form.setData('valid_until', e.target.value)} />
                            </label>
                            <label className="block">
                                <span className={labelClass}>Offer date</span>
                                <DatePicker className={fieldClass} value={form.data.offer_date} onChange={(e) => form.setData('offer_date', e.target.value)} />
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
                        hint="Briefly describe what this offer covers."
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
                        title="Quotation lines"
                        hint="List the products and services included in this offer."
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
                                    value={copyright}
                                    onChange={(e) => setCopyright(e.target.value)}
                                    placeholder="Select a regime"
                                    options={[
                                        { value: 'Full ownership transfer', label: 'Full ownership transfer' },
                                        { value: 'License to use', label: 'License to use' },
                                        { value: 'Rights remain with the company', label: 'Rights remain with the company' },
                                    ]}
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
                        id="email"
                        title="Email and attachments"
                        hint="Prepare the message and attach a PDF appendix."
                        open={open.email}
                        onToggle={(id) => setOpen((value) => ({ ...value, [id]: !value[id] }))}
                    >
                        <label className="block">
                            <span className={labelClass}>E-mail</span>
                            <div className="mb-2 flex flex-wrap gap-2 text-xs">
                                {['#CLIENTNAME#', '#COMPANY#', '#OFFERLINK#'].map((code) => (
                                    <button
                                        key={code}
                                        type="button"
                                        onClick={() => setEmailMessage((value) => `${value || ''}${value ? ' ' : ''}${code}`)}
                                        className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                                    >
                                        {code}
                                    </button>
                                ))}
                            </div>
                            <RichTextEditor value={emailMessage} onChange={setEmailMessage} minHeight="10rem" />
                        </label>
                        <div className="mt-5">
                            <span className={labelClass}>Appendix</span>
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => setAttachmentName(e.target.files?.[0]?.name || '')}
                                />
                                {attachmentName || 'Choose your file'}
                            </label>
                            <p className="mt-2 text-xs text-slate-400">You can only upload a .pdf</p>
                        </div>
                    </Section>
                </div>
            </form>

            {previewOpen && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-100 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
                            <div>
                                <div className="text-sm font-semibold text-slate-900">Quotation preview</div>
                                <div className="text-xs text-slate-400">Live preview — PDF is generated when the offer is sent</div>
                            </div>
                            <button type="button" onClick={() => setPreviewOpen(false)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50" aria-label="Close preview">
                                <Icon name="close" className="h-4 w-4" />
                                Close
                            </button>
                        </div>
                        <div className="overflow-auto p-4 sm:p-6">
                            <div className="mx-auto max-w-3xl overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-slate-200">
                                <OfferPreview
                                    number={offer?.offer_number || nextOfferNumber}
                                    date={form.data.offer_date}
                                    validUntil={form.data.valid_until}
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
                                        attn: selectedCustomer?.org_name
                                            ? [selectedCustomer.first_name, selectedCustomer.surname].filter(Boolean).join(' ')
                                            : '',
                                        address: selectedCustomer?.office_address,
                                        email: selectedCustomer?.email,
                                    }}
                                    scope={form.data.desc || form.data.intro}
                                    items={items}
                                    notes={[copyright && `Copyright: ${copyright}`, conditions && `Special conditions: ${conditions}`, form.data.notes]
                                        .filter(Boolean)
                                        .join('\n\n')}
                                    vatRate={vatRate}
                                    sender={{
                                        name: [activeCompany?.first_name, activeCompany?.surname].filter(Boolean).join(' '),
                                        title: activeCompany?.self_employed_activity,
                                    }}
                                    client={{
                                        name: [selectedCustomer?.first_name, selectedCustomer?.surname].filter(Boolean).join(' '),
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
