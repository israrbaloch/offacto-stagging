import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../../Components/Button';
import { Select } from '../../Components/Input';
import InvoicePreview from '../../Components/InvoicePreview';
import InvoiceReminderModal from '../../Components/InvoiceReminderModal';
import SendInvoiceModal from '../../Components/SendInvoiceModal';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { useUi } from '../../context/UiContext';
import { t } from '../../lib/i18n';
import { customerName, formatDate, money } from '../../lib/utils';

export default function Show({
    invoice,
    ipTransferTypes = {},
    peppolConfigured = false,
    mollieConfigured = false,
    postbodeConfigured = false,
}) {
    const { activeCompany } = usePage().props;
    const { confirm } = useUi();
    const [sendOpen, setSendOpen] = useState(false);
    const [reminderOpen, setReminderOpen] = useState(false);
    const recurring = useForm({
        is_recurring: Boolean(invoice.is_recurring),
        recurring_interval: invoice.recurring_interval || 'monthly',
    });

    const isDraft = String(invoice.status_relation?.name || '').toLowerCase() === 'draft';
    const canRemind = !isDraft && invoice.payment_status !== 'paid' && Boolean(invoice.customer?.email);
    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
        `Invoice ${invoice.invoice_number} — ${money(invoice.amount_due)} due ${formatDate(invoice.due_date)}`,
    )}`;

    const company = invoice.company || activeCompany || {};
    const customer = invoice.customer || {};
    const copyrightLabel = ipTransferTypes[invoice.ip_transfer_type] || '';

    return (
        <AuthenticatedLayout title={invoice.invoice_number}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">{invoice.invoice_number}</h1>
                    <p className="text-sm text-slate-500">
                        {customerName(invoice.customer)} · {formatDate(invoice.invoice_date)} · {invoice.status_relation?.name} ·{' '}
                        {invoice.payment_status}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!isDraft && (
                        <Button href={`/invoices/${invoice.id}/preview`} as="a" variant="secondary" target="_blank" rel="noreferrer">
                            Preview PDF
                        </Button>
                    )}
                    <Button href={`/invoices/${invoice.id}/edit`} variant="secondary">
                        Edit
                    </Button>
                    <Button onClick={() => setSendOpen(true)}>{t('invoices.send_modal_title')}</Button>
                    {canRemind && (
                        <Button variant="secondary" onClick={() => setReminderOpen(true)}>
                            {t('invoices.reminder_send')}
                        </Button>
                    )}
                    {!isDraft && invoice.payment_status !== 'paid' && (
                        <Button
                            variant="secondary"
                            onClick={async () => {
                                if (
                                    await confirm({
                                        message: t('invoices.credit_note_confirm'),
                                        confirmLabel: t('common.confirm'),
                                    })
                                ) {
                                    router.post(`/invoices/${invoice.id}/credit-note`);
                                }
                            }}
                        >
                            Credit note
                        </Button>
                    )}
                    {isDraft && (
                        <Button
                            variant="danger"
                            onClick={async () => {
                                if (
                                    await confirm({
                                        message: t('invoices.delete_confirm'),
                                        confirmLabel: t('common.delete'),
                                        danger: true,
                                    })
                                ) {
                                    router.delete(`/invoices/${invoice.id}`);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            {invoice.needs_resend && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {t('invoices.resend_required_banner')}
                </div>
            )}

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={recurring.data.is_recurring}
                            onChange={(e) => recurring.setData('is_recurring', e.target.checked)}
                        />
                        {t('invoices.recurring_enable')}
                    </label>
                    {recurring.data.is_recurring && (
                        <Select
                            value={recurring.data.recurring_interval}
                            onChange={(e) => recurring.setData('recurring_interval', e.target.value)}
                            options={[
                                { value: 'weekly', label: t('invoices.recurring_weekly') },
                                { value: 'monthly', label: t('invoices.recurring_monthly') },
                                { value: 'yearly', label: t('invoices.recurring_yearly') },
                            ]}
                        />
                    )}
                    <Button variant="secondary" onClick={() => recurring.post(`/invoices/${invoice.id}/recurring`)}>
                        {t('invoices.recurring_save')}
                    </Button>
                    {invoice.is_recurring && invoice.next_run_at && (
                        <span className="text-slate-600">
                            {t('invoices.recurring_next_run', { date: formatDate(invoice.next_run_at) })}
                        </span>
                    )}
                    {invoice.parent_invoice_id && (
                        <span className="text-slate-500">{t('invoices.recurring_from_template')}</span>
                    )}
                    {invoice.mollie_checkout_url && (
                        <a href={invoice.mollie_checkout_url} className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">
                            Open Mollie checkout
                        </a>
                    )}
                    {invoice.peppol_sent_at && (
                        <span className="text-emerald-600">Peppol sent {formatDate(invoice.peppol_sent_at)}</span>
                    )}
                    {invoice.postbode_sent_at && (
                        <span className="text-emerald-600">
                            {t('integrations.postbode_sent', { date: formatDate(invoice.postbode_sent_at) })}
                            {invoice.postbode_status ? ` · ${invoice.postbode_status}` : ''}
                        </span>
                    )}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">{t('invoices.recurring_hint')}</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <InvoicePreview
                    number={invoice.invoice_number}
                    date={invoice.invoice_date}
                    dueDate={invoice.due_date}
                    offerNumber={invoice.offer?.offer_number}
                    from={{
                        name: company.company_name,
                        street: company.street,
                        house: company.house,
                        postal_code: company.postal_code,
                        city: company.city,
                        email: company.email,
                    }}
                    to={{
                        name: customer.org_name || [customer.first_name, customer.surname].filter(Boolean).join(' '),
                        attn: customer.org_name ? [customer.first_name, customer.surname].filter(Boolean).join(' ') : '',
                        address: customer.office_address,
                        email: customer.email,
                    }}
                    scope={invoice.desc || invoice.intro}
                    items={(invoice.items || []).map((item) => ({
                        service_name: item.service?.name,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total,
                        billing_mode: item.service?.billing_mode,
                        unit: item.service?.unit,
                    }))}
                    notes={invoice.notes}
                    copyrightLabel={copyrightLabel}
                    totalsOverride={{
                        subtotal: invoice.subtotal,
                        tax: invoice.tax_amount,
                        total: invoice.total,
                    }}
                    theme={activeCompany?.theme}
                    logoUrl={activeCompany?.invoice_logo_url}
                />
            </div>
            <p className="mt-3 text-sm text-slate-500">
                Amount due: <span className="font-semibold text-slate-800">{money(invoice.amount_due)}</span>
                {invoice.payment_status && <span className="ml-2 text-slate-400">· {invoice.payment_status}</span>}
            </p>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-3 font-semibold">{t('invoices.section_attachments')}</h2>
                <ul className="mb-3 space-y-2">
                    {(invoice.attachments || []).map((file) => (
                        <li key={file.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                            <span className="truncate">{file.original_name}</span>
                            {isDraft && (
                                <button
                                    type="button"
                                    className="text-rose-600 hover:underline"
                                    onClick={() => router.delete(`/invoices/${invoice.id}/attachments/${file.id}`)}
                                >
                                    Remove
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                {isDraft && (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 hover:border-indigo-300">
                        <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const data = new FormData();
                                data.append('file', file);
                                router.post(`/invoices/${invoice.id}/attachments`, data, { forceFormData: true });
                                e.target.value = '';
                            }}
                        />
                        Upload PDF attachment
                    </label>
                )}
            </section>

            {(invoice.payments || []).length > 0 && (
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="mb-3 font-semibold">Payments</h2>
                    <ul className="space-y-2 text-sm">
                        {invoice.payments.map((payment) => (
                            <li key={payment.id} className="flex justify-between">
                                <span>
                                    {formatDate(payment.payment_date)} · {payment.payment_method}
                                </span>
                                <span>{money(payment.amount)}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <SendInvoiceModal
                open={sendOpen}
                onClose={() => setSendOpen(false)}
                invoiceId={invoice.id}
                documentNumber={invoice.invoice_number}
                defaultEmail={invoice.customer?.email || ''}
                defaultMessage={invoice.email_message || ''}
                postbodeConfigured={postbodeConfigured}
                peppolConfigured={peppolConfigured}
                mollieConfigured={mollieConfigured && invoice.payment_status !== 'paid'}
                whatsappShareUrl={whatsappShareUrl}
            />
            <InvoiceReminderModal
                open={reminderOpen}
                onClose={() => setReminderOpen(false)}
                invoiceId={invoice.id}
                defaultEmail={invoice.customer?.email || ''}
            />
        </AuthenticatedLayout>
    );
}
