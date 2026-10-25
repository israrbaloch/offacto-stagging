import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import InvoiceDocumentPreview, { invoiceTemplateLabel, normalizeInvoiceTemplate } from './InvoiceDocumentPreview';
import LineItemsEditor from './LineItemsEditor';
import InvoiceAcknowledgmentPanel from './InvoiceAcknowledgmentPanel';
import InvoiceReminderModal from './InvoiceReminderModal';
import SendInvoiceModal from './SendInvoiceModal';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { useUi } from '../context/UiContext';
import { attachServiceFields } from '../lib/serviceBilling';
import { t } from '../lib/i18n';
import { customerName, formatDate, money, optionsFromMap } from '../lib/utils';

function dateValue(value) {
    if (!value) {
        return '';
    }
    return String(value).slice(0, 10);
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
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

function dueFromTerm(invoiceDate, term) {
    const base = invoiceDate ? new Date(invoiceDate) : new Date();
    if (Number.isNaN(base.getTime())) {
        return '';
    }
    if (term === 'immediate') {
        return dateValue(base);
    }
    const days = term === '14' ? 14 : 30;
    base.setDate(base.getDate() + days);
    return dateValue(base);
}

function resolveHeadingDocType(invoice) {
    if (invoice?.parent_invoice_id) {
        return 'credit';
    }
    return 'inv';
}

function initialTypeTab(invoice, isDraft) {
    if (invoice?.parent_invoice_id) {
        return 'credit';
    }
    if (isDraft && invoice?.is_recurring) {
        return 'rec';
    }
    return 'inv';
}

function DemoToggle({ on, onToggle, ariaLabel, disabled = false }) {
    return (
        <button
            type="button"
            className={`offacto-invoice-toggle${on ? ' on' : ''}`}
            aria-pressed={on}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={() => {
                if (!disabled) {
                    onToggle(!on);
                }
            }}
        />
    );
}

export default function InvoiceEditor({
    invoice = null,
    customers = {},
    servicesData = [],
    defaultStatusId,
    existingItems = [],
    vatRate = 21,
    nextInvoiceNumber = '',
    customersData = [],
    ipTransferTypes = {},
    legalDocuments = [],
    postbodeConfigured = false,
    peppolConfigured = false,
    mollieConfigured = false,
    whatsappConfigured = false,
    whatsappShareUrl = '',
    defaultReminderMessage = '',
}) {
    const { activeCompany, defaultReminderMessage: pageReminderMessage = '' } = usePage().props;
    const reminderDefault = defaultReminderMessage || pageReminderMessage || '';
    const { toast, confirm } = useUi();
    const parsed = parseIntro(invoice?.intro || '');
    const parsedNotes = parseNotes(invoice?.notes || '');
    const ready = useRef(false);

    const [items, setItems] = useState(existingItems);
    const isDraft = String(invoice?.status_relation?.name || 'draft').toLowerCase() === 'draft';
    const readOnly = !isDraft;
    const [typeTab, setTypeTab] = useState(() => initialTypeTab(invoice, isDraft));
    const [paymentTerm, setPaymentTerm] = useState('30');
    const [customerRef, setCustomerRef] = useState('');
    const [creditReason, setCreditReason] = useState('');
    const [recurringInterval, setRecurringInterval] = useState(invoice?.recurring_interval || 'monthly');
    const [molliePaymentToggle, setMolliePaymentToggle] = useState(Boolean(mollieConfigured));
    const [mollieDirectDebitToggle, setMollieDirectDebitToggle] = useState(Boolean(mollieConfigured));
    const [reminderToggle, setReminderToggle] = useState(Boolean(invoice?.reminder_enabled));
    const [accountantToggle, setAccountantToggle] = useState(true);
    const [sendOpen, setSendOpen] = useState(false);
    const [reminderOpen, setReminderOpen] = useState(false);
    const [emailMessage] = useState(
        invoice?.email_message ||
            'Hi #CLIENTNAME#,\n\nPlease find invoice #INVOICENUMBER# from #COMPANY# attached.\n\nPay online: #PAYLINK#\n\nThank you,\n#COMPANY#',
    );
    const [selectedLegal] = useState(() =>
        legalDocuments.filter((doc) => doc.attach_to_quotes_default).map((doc) => doc.id),
    );
    const [savedAt, setSavedAt] = useState(invoice?.updated_at || null);
    const [saving, setSaving] = useState(false);
    const [title] = useState(parsed.title);
    const [conditions] = useState(parsedNotes.conditions);

    const isSent = readOnly;
    const canCreateFromSource = readOnly && !invoice?.parent_invoice_id;
    const isPaid = String(invoice?.payment_status || '').toLowerCase() === 'paid';

    const form = useForm({
        customer_id: invoice?.customer_id || '',
        offer_id: invoice?.offer_id || '',
        invoice_date: isDraft ? todayISO() : dateValue(invoice?.invoice_date) || todayISO(),
        due_date: dateValue(invoice?.due_date),
        intro: parsed.intro,
        desc: invoice?.desc || '',
        notes: parsedNotes.comments,
        status: invoice?.status || defaultStatusId || '',
        ip_transfer_type: invoice?.ip_transfer_type || '',
    });

    const payloadFromState = () => {
        const invoiceDate = isDraft ? todayISO() : form.data.invoice_date || null;
        return {
            customer_id: form.data.customer_id || null,
            offer_id: form.data.offer_id || null,
            invoice_date: invoiceDate,
            due_date: form.data.due_date || null,
            intro: title ? `${title}\n\n${form.data.intro || ''}`.trim() : form.data.intro,
            desc: form.data.desc,
            notes: [conditions && `Special conditions: ${conditions}`, form.data.notes].filter(Boolean).join('\n\n'),
            status: form.data.status,
            ip_transfer_type: form.data.ip_transfer_type || null,
            email_message: emailMessage,
            items: items
                .filter((item) => item.service_id)
                .map((item) => ({
                    service_id: item.service_id,
                    description: item.description,
                    quantity: item.kind === 'text' ? 1 : item.quantity,
                    price: item.kind === 'text' ? 0 : item.price,
                })),
        };
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            ready.current = true;
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (readOnly || items.length > 0 || !servicesData?.length) {
            return;
        }
        const first = servicesData[0];
        setItems([
            attachServiceFields(
                {
                    kind: 'custom',
                    service_id: first?.id || '',
                    service_name: first?.name || 'Custom line',
                    description: '',
                    quantity: 1,
                    price: 0,
                },
                first,
            ),
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isDraft) {
            return;
        }
        const today = todayISO();
        form.setData('invoice_date', today);
        form.setData('due_date', dueFromTerm(today, paymentTerm));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invoice?.id, isDraft]);

    useEffect(() => {
        if (!invoice?.id || !ready.current || !isDraft) {
            return undefined;
        }
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
    }, [form.data, items, invoice?.id]);

    const customerOptions = optionsFromMap(customers);
    const selectedCustomer = customersData.find((item) => String(item.id) === String(form.data.customer_id));
    const canRemind = readOnly && !isPaid && Boolean(selectedCustomer?.email);
    const issueDate = isDraft ? todayISO() : dateValue(form.data.invoice_date);
    const copyrightLabel = ipTransferTypes[form.data.ip_transfer_type] || '';
    const brand = activeCompany?.theme?.primary || '#6B59DC';

    const intraEu =
        selectedCustomer?.vat_number &&
        selectedCustomer?.country_code &&
        String(selectedCustomer.country_code).toUpperCase() !== 'BE';

    const autoAttachments = useMemo(() => {
        const legal = legalDocuments
            .filter((doc) => selectedLegal.includes(doc.id))
            .map((doc) => [doc.original_name || doc.type, t('invoices.auto_attachment_legal')]);
        const pdfs = (invoice?.attachments || []).map((file) => [file.original_name, t('invoices.auto_attachment_pdf')]);
        return [...legal, ...pdfs];
    }, [invoice?.attachments, legalDocuments, selectedLegal]);

    const invoiceTemplate = normalizeInvoiceTemplate(activeCompany?.invoice_template);
    const isMinimalTemplate = invoiceTemplate === 'minimal';
    const previewAttachments = autoAttachments.map(([name]) => name);

    const submit = (event) => {
        event.preventDefault();
        if (!invoice?.id || !isDraft) {
            return;
        }
        form.transform(() => payloadFromState());
        form.put(`/invoices/${invoice.id}`, {
            onSuccess: () => toast.success(t('invoices.draft_saved_toast')),
        });
    };

    const saveThen = (callback) => {
        if (!isDraft) {
            callback();
            return;
        }
        form.transform(() => payloadFromState());
        form.put(`/invoices/${invoice.id}`, {
            preserveScroll: true,
            onSuccess: callback,
        });
    };

    const openSendModal = () => {
        if (!invoice?.id) {
            return;
        }
        if (!form.data.customer_id) {
            toast.error(t('offers.send_need_customer'));
            return;
        }
        setSendOpen(true);
    };

    const deleteDraft = async () => {
        if (!invoice?.id || !isDraft) {
            return;
        }
        if (
            !(await confirm({
                message: t('invoices.delete_confirm'),
                confirmLabel: t('common.delete'),
                danger: true,
            }))
        ) {
            return;
        }
        router.delete(`/invoices/${invoice.id}`, {
            onSuccess: () => toast.success(t('invoices.deleted_toast')),
        });
    };

    const createCreditFromInvoice = async () => {
        if (!invoice?.id || !canCreateFromSource) {
            return;
        }
        if (
            !(await confirm({
                message: t('invoices.credit_note_confirm'),
                confirmLabel: t('common.confirm'),
            }))
        ) {
            return;
        }
        router.post(`/invoices/${invoice.id}/credit-note`);
    };

    const createRecurringFromInvoice = async () => {
        if (!invoice?.id || !canCreateFromSource) {
            return;
        }
        if (
            !(await confirm({
                message: t('invoices.recurring_from_sent_confirm'),
                confirmLabel: t('common.confirm'),
            }))
        ) {
            return;
        }
        router.post(`/invoices/${invoice.id}/recurring-from`);
    };

    const addLine = () => {
        if (readOnly) {
            return;
        }
        const first = servicesData[0];
        setItems([
            ...items,
            attachServiceFields(
                {
                    kind: 'custom',
                    service_id: first?.id || '',
                    service_name: first?.name || 'Custom line',
                    description: '',
                    quantity: 1,
                    price: 0,
                },
                first,
            ),
        ]);
    };

    const onPaymentTermChange = (term) => {
        setPaymentTerm(term);
        const base = isDraft ? todayISO() : form.data.invoice_date;
        if (isDraft) {
            form.setData('invoice_date', todayISO());
        }
        form.setData('due_date', dueFromTerm(base, term));
    };

    const savedLabel = saving
        ? t('invoices.saving_draft')
        : savedAt
          ? t('invoices.draft_saved_at', {
                time: new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })
          : t('invoices.draft_created');

    const headingDoc = resolveHeadingDocType(invoice);
    const docTitle =
        headingDoc === 'credit'
            ? t('invoices.doc_credit')
            : t('invoices.doc_standard');

    const heading = invoice?.invoice_number
        ? `${docTitle} ${invoice.invoice_number}`
        : t('invoices.new_heading', {
              type:
                  typeTab === 'credit'
                      ? t('invoices.doc_credit').toLowerCase()
                      : typeTab === 'rec'
                        ? t('invoices.doc_recurring').toLowerCase()
                        : t('invoices.doc_standard').toLowerCase(),
          });

    const previewDocumentType =
        invoice?.parent_invoice_id || typeTab === 'credit'
            ? 'credit'
            : typeTab === 'rec'
              ? 'recurring'
              : 'invoice';

    const metaLine = readOnly
        ? [
              customerName(selectedCustomer),
              issueDate ? formatDate(issueDate) : '',
              invoice?.status_relation?.name,
              invoice?.payment_status,
          ]
              .filter(Boolean)
              .join(' · ')
        : savedLabel;

    return (
        <AuthenticatedLayout title={heading}>
            <form
                onSubmit={submit}
                className={`offacto-briefings offacto-quote-builder-page offacto-invoice-builder-page${readOnly ? ' offacto-invoice-builder-page--readonly' : ''}`}
            >
                {readOnly ? (
                    <div className="offacto-invoice-note mb-4">
                        <Icon name="lock" />
                        <div>{t('invoices.sent_locked_banner')}</div>
                    </div>
                ) : null}
                {invoice?.needs_resend ? (
                    <div className="offacto-invoice-note warn mb-4">
                        <Icon name="alert" />
                        <div>{t('invoices.resend_required_banner')}</div>
                    </div>
                ) : null}

                <header className="offacto-brief-edit-ph">
                    <div>
                        <Link href="/invoices" className="offacto-brief-edit-crumb">
                            <Icon name="back" />
                            {t('invoices.title')}
                        </Link>
                        <h1>{heading}</h1>
                        <p className="offacto-invoice-saved-hint">{metaLine}</p>
                        {readOnly && invoice?.amount_due != null ? (
                            <p className="offacto-invoice-hint">
                                {t('invoices.amount_due_label')}: <b>{money(invoice.amount_due)}</b>
                            </p>
                        ) : null}
                    </div>
                    <div className="offacto-brief-edit-acts">
                        {isDraft ? (
                            <button type="button" className="offacto-brief-btn offacto-invoice-delete-btn" onClick={deleteDraft}>
                                <Icon name="trash" />
                                {t('common.delete')}
                            </button>
                        ) : null}
                        {isDraft ? (
                            <button type="submit" className="offacto-brief-btn" disabled={form.processing}>
                                {t('invoices.save_draft')}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            className="offacto-brief-btn"
                            onClick={() => {
                                if (isSent && invoice?.id) {
                                    window.open(`/invoices/${invoice.id}/preview`, '_blank', 'noopener,noreferrer');
                                    return;
                                }
                                toast.info(t('invoices.pdf_after_send_hint'));
                            }}
                        >
                            <Icon name="down" />
                            PDF
                        </button>
                        {canRemind ? (
                            <button type="button" className="offacto-brief-btn" onClick={() => setReminderOpen(true)}>
                                <Icon name="bell" />
                                {t('invoices.reminder_send')}
                            </button>
                        ) : null}
                        {invoice?.id && isDraft ? (
                            <button
                                type="button"
                                className="offacto-btn-p"
                                disabled={form.processing || activeCompany?.trial_expired || activeCompany?.pending_approval}
                                onClick={openSendModal}
                            >
                                <Icon name="send" />
                                {t('invoices.send_action')}
                            </button>
                        ) : null}
                        {invoice?.id && readOnly ? (
                            <button
                                type="button"
                                className="offacto-btn-p"
                                disabled={activeCompany?.trial_expired || activeCompany?.pending_approval}
                                onClick={() => setSendOpen(true)}
                            >
                                <Icon name="send" />
                                {t('invoices.send_action')}
                            </button>
                        ) : null}
                    </div>
                </header>

                {readOnly && invoice ? <InvoiceAcknowledgmentPanel invoice={invoice} /> : null}

                <div className="offacto-invoice-ed">
                    <div className="offacto-invoice-ed-main">
                        <div className="offacto-brief-edit-card">
                            <div className="offacto-brief-edit-card-b">
                                <div className="offacto-dash-tabs offacto-invoice-type-tabs">
                                    {[
                                        { id: 'inv', label: t('invoices.doc_standard') },
                                        { id: 'credit', label: t('invoices.doc_credit') },
                                        { id: 'rec', label: t('invoices.doc_recurring_short') },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            className={typeTab === tab.id ? 'on' : ''}
                                            onClick={() => setTypeTab(tab.id)}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {typeTab === 'credit' ? (
                                    <div className="offacto-invoice-type-extra">
                                        {invoice?.parent_invoice ? (
                                            <div className="offacto-brief-edit-fg2">
                                                <label className="block">
                                                    <span className="offacto-brief-edit-lbl">{t('invoices.credits_invoice')}</span>
                                                    <input
                                                        className="offacto-brief-inp"
                                                        readOnly
                                                        value={`${invoice.parent_invoice.invoice_number} · ${money(invoice.parent_invoice.total)}`}
                                                    />
                                                </label>
                                                <label className="block">
                                                    <span className="offacto-brief-edit-lbl">{t('invoices.credit_reason')}</span>
                                                    <input
                                                        className="offacto-brief-inp"
                                                        value={creditReason}
                                                        onChange={(e) => setCreditReason(e.target.value)}
                                                        placeholder={t('invoices.credit_reason_placeholder')}
                                                        readOnly={readOnly}
                                                    />
                                                </label>
                                            </div>
                                        ) : canCreateFromSource ? (
                                            <div className="offacto-invoice-type-cta">
                                                <p className="offacto-invoice-hint">{t('invoices.credit_from_invoice_hint')}</p>
                                                <button type="button" className="offacto-btn-p" onClick={createCreditFromInvoice}>
                                                    <Icon name="invoice" />
                                                    {t('invoices.credit_note')}
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="offacto-invoice-hint">{t('invoices.credit_note_hint')}</p>
                                        )}
                                        {!readOnly ? (
                                            <div className="offacto-invoice-note warn">
                                                <Icon name="alert" />
                                                <div>{t('invoices.credit_note_policy')}</div>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}

                                {typeTab === 'rec' ? (
                                    <div className="offacto-invoice-type-extra">
                                        {canCreateFromSource ? (
                                            <div className="offacto-invoice-type-cta">
                                                <p className="offacto-invoice-hint">{t('invoices.recurring_from_invoice_hint')}</p>
                                                <button type="button" className="offacto-btn-p" onClick={createRecurringFromInvoice}>
                                                    <Icon name="repeat" />
                                                    {t('invoices.recurring_from_sent')}
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="offacto-brief-edit-fg2">
                                                    <label className="block">
                                                        <span className="offacto-brief-edit-lbl">{t('invoices.recurring_frequency')}</span>
                                                        <select
                                                            className="offacto-brief-inp"
                                                            value={recurringInterval}
                                                            onChange={(e) => setRecurringInterval(e.target.value)}
                                                            disabled={readOnly}
                                                        >
                                                            <option value="monthly">{t('invoices.recurring_monthly')}</option>
                                                            <option value="yearly">{t('invoices.recurring_yearly')}</option>
                                                        </select>
                                                    </label>
                                                    <label className="block">
                                                        <span className="offacto-brief-edit-lbl">{t('invoices.recurring_end')}</span>
                                                        <select className="offacto-brief-inp" defaultValue="never" disabled={readOnly}>
                                                            <option value="12">{t('invoices.recurring_after_12')}</option>
                                                            <option value="never">{t('invoices.recurring_never')}</option>
                                                        </select>
                                                    </label>
                                                </div>
                                                <div className="offacto-invoice-toggle-row">
                                                    <span>{t('invoices.mollie_direct_debit')}</span>
                                                    <DemoToggle
                                                        on={mollieDirectDebitToggle}
                                                        onToggle={setMollieDirectDebitToggle}
                                                        ariaLabel={t('invoices.mollie_direct_debit')}
                                                        disabled={readOnly}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="offacto-brief-edit-card">
                            <div className="offacto-brief-edit-card-h">
                                <h3>{t('dashboard.customer')}</h3>
                                <div className="offacto-invoice-card-acts">
                                    {peppolConfigured && selectedCustomer?.vat_number ? (
                                        <span className="offacto-demo-badge ok nd">
                                            <Icon name="check" />
                                            Peppol
                                        </span>
                                    ) : (
                                        <span className="offacto-demo-badge warn nd">{t('invoices.not_on_peppol')}</span>
                                    )}
                                </div>
                            </div>
                            <div className="offacto-brief-edit-card-b offacto-invoice-fg">
                                <label className="block">
                                    <span className="offacto-brief-edit-lbl">{t('dashboard.customer')}</span>
                                    <select
                                        className="offacto-brief-inp"
                                        value={form.data.customer_id}
                                        onChange={(e) => form.setData('customer_id', e.target.value)}
                                        aria-invalid={Boolean(form.errors.customer_id)}
                                        disabled={readOnly}
                                    >
                                        <option value="">{t('invoices.select_customer')}</option>
                                        {customerOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.customer_id ? (
                                        <p className="offacto-quote-hint">{form.errors.customer_id}</p>
                                    ) : null}
                                    {selectedCustomer?.vat_number ? (
                                        <div className="offacto-invoice-okline">
                                            <Icon name="check" />
                                            VIES: {selectedCustomer.vat_number} {t('invoices.vies_valid')}
                                        </div>
                                    ) : (
                                        <p className="offacto-invoice-hint">{t('invoices.no_vat_hint')}</p>
                                    )}
                                </label>
                                <div className="offacto-brief-edit-fg2">
                                    <label className="block">
                                        <span className="offacto-brief-edit-lbl">{t('invoices.issue_date')}</span>
                                        <input
                                            type="date"
                                            className="offacto-brief-inp"
                                            value={issueDate}
                                            readOnly
                                            aria-readonly="true"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="offacto-brief-edit-lbl">{t('invoices.payment_term')}</span>
                                        <select
                                            className="offacto-brief-inp"
                                            value={paymentTerm}
                                            onChange={(e) => onPaymentTermChange(e.target.value)}
                                            disabled={readOnly}
                                        >
                                            <option value="30">{t('invoices.term_30')}</option>
                                            <option value="14">{t('invoices.term_14')}</option>
                                            <option value="immediate">{t('invoices.term_immediate')}</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="offacto-brief-edit-fg2">
                                    <label className="block">
                                        <span className="offacto-brief-edit-lbl">{t('invoices.customer_po')}</span>
                                        <input
                                            className="offacto-brief-inp"
                                            value={customerRef}
                                            onChange={(e) => setCustomerRef(e.target.value)}
                                            placeholder="PO-2026-118"
                                            readOnly={readOnly}
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="offacto-brief-edit-lbl">{t('invoices.structured_reference')}</span>
                                        <input className="offacto-brief-inp" readOnly value="—" />
                                    </label>
                                </div>
                                {intraEu ? (
                                    <div className="offacto-invoice-note">
                                        <Icon name="globe" />
                                        <div>{t('invoices.intra_eu_note', { country: selectedCustomer.country_code })}</div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="offacto-brief-edit-card">
                            <div className="offacto-brief-edit-card-h">
                                <h3>{t('invoices.section_lines')}</h3>
                                {!readOnly ? (
                                    <div className="offacto-invoice-card-acts">
                                        <button
                                            type="button"
                                            className="offacto-brief-btn-sm"
                                            onClick={() => toast.info(t('invoices.import_hours_toast'))}
                                        >
                                            <Icon name="clock" />
                                            {t('invoices.import_hours')}
                                        </button>
                                        <button type="button" className="offacto-brief-btn-sm" onClick={addLine}>
                                            <Icon name="plus" />
                                            {t('invoices.add_line')}
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                            <div className="offacto-brief-edit-card-b">
                                <LineItemsEditor
                                    items={items}
                                    setItems={setItems}
                                    services={servicesData}
                                    vatRate={intraEu ? 0 : vatRate}
                                    error={form.errors.items}
                                    variant="builder"
                                    invoiceStyle
                                    suppressToolbar
                                    readOnly={readOnly}
                                />
                            </div>
                        </div>

                        <div className="offacto-brief-edit-card">
                            <div className="offacto-brief-edit-card-h">
                                <h3>{t('invoices.payment_reminders_attachments')}</h3>
                            </div>
                            <div className="offacto-brief-edit-card-b offacto-invoice-fg">
                                {typeTab !== 'credit' ? (
                                    <>
                                        <div className="offacto-invoice-toggle-row">
                                            <div>
                                                <b>{t('invoices.mollie_payment_link')}</b>
                                                <p className="offacto-invoice-hint">{t('invoices.mollie_payment_link_hint')}</p>
                                            </div>
                                            <DemoToggle
                                                on={molliePaymentToggle && mollieConfigured}
                                                onToggle={setMolliePaymentToggle}
                                                ariaLabel={t('invoices.mollie_payment_link')}
                                                disabled={readOnly}
                                            />
                                        </div>
                                        <div className="offacto-invoice-toggle-row">
                                            <div>
                                                <b>{t('invoices.auto_reminders')}</b>
                                                <p className="offacto-invoice-hint">{t('invoices.auto_reminders_hint')}</p>
                                            </div>
                                            <DemoToggle
                                                on={reminderToggle}
                                                onToggle={setReminderToggle}
                                                ariaLabel={t('invoices.auto_reminders')}
                                                disabled={readOnly}
                                            />
                                        </div>
                                    </>
                                ) : null}
                                <div className="offacto-invoice-toggle-row">
                                    <div>
                                        <b>{t('invoices.copy_accountant')}</b>
                                        <p className="offacto-invoice-hint">{activeCompany?.email || '—'}</p>
                                    </div>
                                    <DemoToggle
                                        on={accountantToggle}
                                        onToggle={setAccountantToggle}
                                        ariaLabel={t('invoices.copy_accountant')}
                                        disabled={readOnly}
                                    />
                                </div>
                                <div className="offacto-invoice-sep" />
                                <div>
                                    <b>{t('invoices.section_attachments')}</b>
                                    {autoAttachments.length ? (
                                        autoAttachments.map(([name, hint]) => (
                                            <div key={name} className="offacto-invoice-att-row">
                                                <Icon name="clip" />
                                                <div>
                                                    <b>{name}</b>
                                                    <p className="offacto-invoice-hint">{hint}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="offacto-invoice-hint">{t('invoices.no_auto_attachments')}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {readOnly && (invoice?.payments || []).length > 0 ? (
                            <div className="offacto-brief-edit-card">
                                <div className="offacto-brief-edit-card-h">
                                    <h3>{t('invoices.section_payments')}</h3>
                                </div>
                                <div className="offacto-brief-edit-card-b">
                                    <ul className="offacto-invoice-payments-list">
                                        {invoice.payments.map((payment) => (
                                            <li key={payment.id}>
                                                <span>
                                                    {formatDate(payment.payment_date)} · {payment.payment_method}
                                                </span>
                                                <span>{money(payment.amount)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <aside className="offacto-invoice-sticky">
                        <div className="offacto-invoice-preview-meta">
                            <span className="offacto-demo-badge nd">
                                <Icon name="eye" />
                                {t('invoices.live_preview')} · {invoiceTemplateLabel(invoiceTemplate)}
                            </span>
                            <Link href="/company/settings?section=branding" className="offacto-invoice-template-link">
                                {t('invoices.edit_template')}
                            </Link>
                        </div>
                        <div
                            className={`offacto-invoice-paper${isMinimalTemplate ? ' offacto-invoice-paper--minimal' : ''}`}
                            style={{ '--brand': brand }}
                        >
                            {isMinimalTemplate ? null : (
                                <div className="offacto-invoice-paper-brand" style={{ background: brand }} />
                            )}
                            <div className={isMinimalTemplate ? undefined : 'offacto-invoice-paper-inner'}>
                                <InvoiceDocumentPreview
                                    template={invoiceTemplate}
                                    number={invoice?.invoice_number || nextInvoiceNumber}
                                    date={issueDate}
                                    dueDate={form.data.due_date}
                                    offerNumber={invoice?.offer?.offer_number}
                                    documentType={previewDocumentType}
                                    intraEu={intraEu}
                                    attachments={previewAttachments}
                                    showMollieLink={molliePaymentToggle && mollieConfigured}
                                    structuredReference="—"
                                    from={{
                                        name: activeCompany?.company_name,
                                        street: activeCompany?.street,
                                        house: activeCompany?.house,
                                        postal_code: activeCompany?.postal_code,
                                        city: activeCompany?.city,
                                        email: activeCompany?.email,
                                    }}
                                    fromVatNumber={activeCompany?.vat_number || ''}
                                    toVatNumber={selectedCustomer?.vat_number || ''}
                                    to={{
                                        name: selectedCustomer?.org_name || customerName(selectedCustomer),
                                        attn: selectedCustomer?.org_name
                                            ? [selectedCustomer?.first_name, selectedCustomer?.surname].filter(Boolean).join(' ')
                                            : '',
                                        address: selectedCustomer?.office_address,
                                        email: selectedCustomer?.email,
                                    }}
                                    scope={form.data.desc || form.data.intro}
                                    items={items}
                                    notes={form.data.notes}
                                    copyrightLabel={copyrightLabel}
                                    vatRate={intraEu ? 0 : vatRate}
                                    theme={activeCompany?.theme}
                                    logoUrl={activeCompany?.invoice_logo_url}
                                />
                            </div>
                            {!isMinimalTemplate && autoAttachments.length ? (
                                <div className="offacto-invoice-paper-att">
                                    {autoAttachments.map(([name]) => (
                                        <span key={name}>📎 {name}</span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </aside>
                </div>
            </form>

            <SendInvoiceModal
                open={sendOpen}
                onClose={() => setSendOpen(false)}
                invoiceId={invoice?.id}
                documentNumber={invoice?.invoice_number || nextInvoiceNumber}
                defaultEmail={selectedCustomer?.email || ''}
                defaultMessage={invoice?.email_message || emailMessage}
                legalDocumentIds={selectedLegal}
                postbodeConfigured={postbodeConfigured}
                peppolConfigured={peppolConfigured}
                mollieConfigured={mollieConfigured && !isPaid}
                whatsappConfigured={whatsappConfigured}
                whatsappShareUrl={whatsappShareUrl || ''}
                onBeforeSend={isDraft ? (runSend) => saveThen(runSend) : undefined}
            />
            <InvoiceReminderModal
                open={reminderOpen}
                onClose={() => setReminderOpen(false)}
                invoiceId={invoice?.id}
                defaultEmail={selectedCustomer?.email || ''}
                defaultMessage={reminderDefault}
            />
        </AuthenticatedLayout>
    );
}
