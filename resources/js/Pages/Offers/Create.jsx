import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import LineItemsEditor from '../../Components/LineItemsEditor';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { money, optionsFromMap } from '../../lib/utils';

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
                <span className={`mt-1 text-slate-400 transition ${open ? 'rotate-180' : ''}`}>⌄</span>
            </button>
            {open && <div className="mt-6">{children}</div>}
        </section>
    );
}

function EditorToolbar({ onWrap }) {
    const buttons = [
        { label: 'B', title: 'Bold', wrap: ['**', '**'] },
        { label: 'I', title: 'Italic', wrap: ['_', '_'] },
        { label: 'U', title: 'Underline', wrap: ['<u>', '</u>'] },
        { label: '•', title: 'List', wrap: ['\n- ', ''] },
    ];

    return (
        <div className="flex flex-wrap gap-1 rounded-t-xl border border-b-0 border-slate-200 bg-slate-50 px-2 py-1.5">
            {buttons.map((button) => (
                <button
                    key={button.title}
                    type="button"
                    title={button.title}
                    onClick={() => onWrap(button.wrap[0], button.wrap[1])}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                >
                    {button.label}
                </button>
            ))}
        </div>
    );
}

function wrapSelected(ref, prefix, suffix, value, onChange) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + prefix + value.slice(start, end) + suffix + value.slice(end);
    onChange(next);
}

function draftKey(companyId) {
    return `offacto.offer.draft.${companyId || 'default'}`;
}

export default function Create({
    customers = {},
    statuses = {},
    servicesData = [],
    defaultStatusId,
    vatRate = 21,
    nextOfferNumber = '',
}) {
    const { activeCompany } = usePage().props;
    const restored = useRef(false);
    const introRef = useRef(null);
    const descRef = useRef(null);
    const emailRef = useRef(null);
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState({
        basic: true,
        assignment: true,
        lines: true,
        copyright: true,
        email: false,
    });
    const [previewOpen, setPreviewOpen] = useState(false);
    const [savedAt, setSavedAt] = useState(null);
    const [title, setTitle] = useState('');
    const [copyright, setCopyright] = useState('');
    const [conditions, setConditions] = useState('');
    const [emailMessage, setEmailMessage] = useState(
        'Hi #CLIENTNAME#,\n\n#COMPANY# has prepared an offer for you. Please review it here: #OFFERLINK#.\n\nOnce you approve, we can get started.\n\nBest regards,\n#COMPANY#',
    );
    const [attachmentName, setAttachmentName] = useState('');
    const [infoOpen, setInfoOpen] = useState(true);

    const form = useForm({
        customer_id: '',
        offer_date: new Date().toISOString().slice(0, 10),
        valid_until: '',
        intro: '',
        desc: '',
        notes: '',
        status: defaultStatusId || '',
    });

    useEffect(() => {
        if (restored.current) return;
        restored.current = true;
        try {
            const raw = localStorage.getItem(draftKey(activeCompany?.id));
            if (!raw) return;
            const draft = JSON.parse(raw);
            form.setData({
                customer_id: draft.customer_id || '',
                offer_date: draft.offer_date || form.data.offer_date,
                valid_until: draft.valid_until || '',
                intro: draft.intro || '',
                desc: draft.desc || '',
                notes: draft.notes || '',
                status: draft.status || defaultStatusId || '',
            });
            setItems(draft.items || []);
            setTitle(draft.title || '');
            setCopyright(draft.copyright || '');
            setConditions(draft.conditions || '');
            setEmailMessage(draft.emailMessage || emailMessage);
            if (draft.savedAt) setSavedAt(draft.savedAt);
        } catch {
            // ignore a broken local draft
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const stamp = new Date().toISOString();
            const payload = {
                ...form.data,
                items,
                title,
                copyright,
                conditions,
                emailMessage,
                savedAt: stamp,
            };
            localStorage.setItem(draftKey(activeCompany?.id), JSON.stringify(payload));
            setSavedAt(stamp);
        }, 1200);
        return () => clearTimeout(timer);
    }, [form.data, items, title, copyright, conditions, emailMessage, activeCompany?.id]);

    const customerOptions = optionsFromMap(customers);
    const customerLabel = customerOptions.find((item) => String(item.value) === String(form.data.customer_id))?.label || 'your client';

    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
        const vat = subtotal * (Number(vatRate) / 100);
        return { subtotal, vat, total: subtotal + vat };
    }, [items, vatRate]);

    const composeNotes = () => {
        const parts = [];
        if (copyright) parts.push(`Copyright: ${copyright}`);
        if (conditions) parts.push(`Special conditions: ${conditions}`);
        if (form.data.notes) parts.push(form.data.notes);
        return parts.join('\n\n');
    };

    const submit = (e) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            intro: title ? `${title}\n\n${data.intro || ''}`.trim() : data.intro,
            notes: composeNotes(),
            items: items
                .filter((item) => item.service_id)
                .map((item) => ({
                    service_id: item.service_id,
                    description: item.description,
                    quantity: item.kind === 'text' ? 1 : item.quantity,
                    price: item.kind === 'text' ? 0 : item.price,
                })),
        }));
        form.post('/offers', {
            onSuccess: () => localStorage.removeItem(draftKey(activeCompany?.id)),
        });
    };

    const savedLabel = savedAt
        ? `Draft saved ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : 'Auto-draft ready';

    return (
        <AuthenticatedLayout title="New offer">
            <form onSubmit={submit}>
                <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur lg:-mx-8 lg:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/offers" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100">
                                ←
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Offer details</h1>
                                <p className="text-xs text-slate-400">{nextOfferNumber || 'New quotation'}</p>
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
                                <select className={fieldClass} value={form.data.customer_id} onChange={(e) => form.setData('customer_id', e.target.value)}>
                                    <option value="">Select a customer</option>
                                    {customerOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.customer_id && <span className="mt-1 block text-xs text-rose-600">{form.errors.customer_id}</span>}
                            </label>
                            <label className="block">
                                <span className={labelClass}>Quote expiration date</span>
                                <input className={fieldClass} type="date" value={form.data.valid_until} onChange={(e) => form.setData('valid_until', e.target.value)} />
                            </label>
                            <label className="block">
                                <span className={labelClass}>Offer date</span>
                                <input className={fieldClass} type="date" value={form.data.offer_date} onChange={(e) => form.setData('offer_date', e.target.value)} />
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
                            <label className="block">
                                <span className={labelClass}>Introduction</span>
                                <EditorToolbar onWrap={(a, b) => wrapSelected(introRef, a, b, form.data.intro, (v) => form.setData('intro', v))} />
                                <textarea
                                    ref={introRef}
                                    className={`${fieldClass} rounded-t-none`}
                                    rows={8}
                                    placeholder="A short opening your client will read first."
                                    value={form.data.intro}
                                    onChange={(e) => form.setData('intro', e.target.value)}
                                />
                                {form.errors.intro && <span className="mt-1 block text-xs text-rose-600">{form.errors.intro}</span>}
                            </label>
                            <label className="block">
                                <span className={labelClass}>Description</span>
                                <EditorToolbar onWrap={(a, b) => wrapSelected(descRef, a, b, form.data.desc, (v) => form.setData('desc', v))} />
                                <textarea
                                    ref={descRef}
                                    className={`${fieldClass} rounded-t-none`}
                                    rows={8}
                                    placeholder="Scope, deliverables, and anything the client should know."
                                    value={form.data.desc}
                                    onChange={(e) => form.setData('desc', e.target.value)}
                                />
                                {form.errors.desc && <span className="mt-1 block text-xs text-rose-600">{form.errors.desc}</span>}
                            </label>
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
                                <button type="button" onClick={() => setInfoOpen(false)} className="text-slate-400">
                                    ×
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
                                <select className={fieldClass} value={copyright} onChange={(e) => setCopyright(e.target.value)}>
                                    <option value="">Select a regime</option>
                                    <option value="Full ownership transfer">Full ownership transfer</option>
                                    <option value="License to use">License to use</option>
                                    <option value="Rights remain with the company">Rights remain with the company</option>
                                </select>
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
                                        onClick={() => setEmailMessage((value) => `${value}${value.endsWith(' ') || value.endsWith('\n') ? '' : ' '}${code}`)}
                                        className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                                    >
                                        {code}
                                    </button>
                                ))}
                            </div>
                            <EditorToolbar onWrap={(a, b) => wrapSelected(emailRef, a, b, emailMessage, setEmailMessage)} />
                            <textarea ref={emailRef} className={`${fieldClass} rounded-t-none`} rows={7} value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} />
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
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-slate-400">Preview</div>
                                <h3 className="mt-1 text-xl font-semibold text-slate-900">{title || 'Untitled offer'}</h3>
                                <p className="text-sm text-slate-500">
                                    {nextOfferNumber} · {customerLabel}
                                </p>
                            </div>
                            <button type="button" onClick={() => setPreviewOpen(false)} className="text-slate-400 hover:text-slate-700">
                                Close
                            </button>
                        </div>
                        <p className="mt-6 whitespace-pre-wrap text-sm text-slate-600">{form.data.intro || 'No introduction yet.'}</p>
                        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600">{form.data.desc}</p>
                        <ul className="mt-6 space-y-2 text-sm">
                            {items.map((item, index) => (
                                <li key={index} className="flex justify-between gap-4 border-b border-slate-100 py-2">
                                    <span>{item.description || item.service_name}</span>
                                    <span>{item.kind === 'text' ? '' : money(Number(item.quantity || 0) * Number(item.price || 0))}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 text-right text-lg font-semibold">{money(totals.total)}</div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
