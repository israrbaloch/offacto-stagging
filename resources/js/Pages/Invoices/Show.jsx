import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../../Components/Button';
import Input, { Select } from '../../Components/Input';
import Modal from '../../Components/Modal';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { customerName, formatDate, money, optionsFromMap } from '../../lib/utils';

export default function Show({
    invoice,
    paymentMethods = {},
    peppolConfigured = false,
    mollieConfigured = false,
}) {
    const [sendOpen, setSendOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);
    const [reminderOpen, setReminderOpen] = useState(false);
    const send = useForm({
        email: invoice.customer?.email || '',
        message: '',
        attach_ubl: false,
        cc_company: false,
    });
    const pay = useForm({
        amount: invoice.amount_due || invoice.total || '',
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: 'bank_transfer',
        reference: '',
        notes: '',
    });
    const reminder = useForm({
        email: invoice.customer?.email || '',
        message: '',
    });
    const recurring = useForm({
        is_recurring: Boolean(invoice.is_recurring),
        recurring_interval: invoice.recurring_interval || 'monthly',
    });

    const whatsappText = encodeURIComponent(
        `Invoice ${invoice.invoice_number} — ${money(invoice.amount_due)} due ${formatDate(invoice.due_date)}`
    );

    return (
        <AuthenticatedLayout title={invoice.invoice_number}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">{invoice.invoice_number}</h1>
                    <p className="text-sm text-slate-500">
                        {customerName(invoice.customer)} · {formatDate(invoice.invoice_date)} · {invoice.status_relation?.name} · {invoice.payment_status}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button href={`/invoices/${invoice.id}/edit`} variant="secondary">
                        Edit
                    </Button>
                    <Button href={`/invoices/${invoice.id}/download`} as="a">
                        PDF
                    </Button>
                    <Button href={`/invoices/${invoice.id}/ubl`} as="a" variant="secondary">
                        UBL
                    </Button>
                    <Button onClick={() => setSendOpen(true)}>Send</Button>
                    <Button variant="secondary" onClick={() => setReminderOpen(true)}>
                        Reminder
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            if (confirm('Create a credit note from this invoice?')) {
                                router.post(`/invoices/${invoice.id}/credit-note`);
                            }
                        }}
                    >
                        Credit note
                    </Button>
                    {mollieConfigured && invoice.payment_status !== 'paid' && (
                        <Button
                            variant="secondary"
                            onClick={() => router.post(`/invoices/${invoice.id}/mollie`)}
                        >
                            Mollie pay link
                        </Button>
                    )}
                    {peppolConfigured && (
                        <Button variant="secondary" onClick={() => router.post(`/invoices/${invoice.id}/peppol`)}>
                            Send Peppol
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        as="a"
                        href={`https://wa.me/?text=${whatsappText}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        WhatsApp
                    </Button>
                    <Button variant="secondary" onClick={() => router.post(`/invoices/${invoice.id}/postbode`)}>
                        Postbode
                    </Button>
                    <Button variant="secondary" onClick={() => setPayOpen(true)}>
                        Record payment
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            if (confirm('Delete this invoice?')) router.delete(`/invoices/${invoice.id}`);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={recurring.data.is_recurring}
                            onChange={(e) => recurring.setData('is_recurring', e.target.checked)}
                        />
                        Recurring invoice
                    </label>
                    {recurring.data.is_recurring && (
                        <Select
                            value={recurring.data.recurring_interval}
                            onChange={(e) => recurring.setData('recurring_interval', e.target.value)}
                            options={[
                                { value: 'weekly', label: 'Weekly' },
                                { value: 'monthly', label: 'Monthly' },
                                { value: 'yearly', label: 'Yearly' },
                            ]}
                        />
                    )}
                    <Button
                        variant="secondary"
                        onClick={() => recurring.post(`/invoices/${invoice.id}/recurring`)}
                    >
                        Save recurring
                    </Button>
                    {invoice.mollie_checkout_url && (
                        <a href={invoice.mollie_checkout_url} className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">
                            Open Mollie checkout
                        </a>
                    )}
                    {invoice.peppol_sent_at && (
                        <span className="text-emerald-600">Peppol sent {formatDate(invoice.peppol_sent_at)}</span>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="whitespace-pre-wrap text-sm text-slate-600">{invoice.intro}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm">{invoice.desc}</p>
                <table className="mt-6 w-full text-left text-sm">
                    <thead className="text-slate-500">
                        <tr>
                            <th className="py-2">Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(invoice.items || []).map((item) => (
                            <tr key={item.id} className="border-t border-slate-100">
                                <td className="py-2">{item.service?.name || item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{money(item.price)}</td>
                                <td>{money(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 space-y-1 text-right text-sm">
                    <div>Total {money(invoice.total)}</div>
                    <div>Due {money(invoice.amount_due)}</div>
                </div>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-3 font-semibold">Attachments</h2>
                <ul className="mb-3 space-y-2">
                    {(invoice.attachments || []).map((file) => (
                        <li key={file.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                            <span className="truncate">{file.original_name}</span>
                            <button
                                type="button"
                                className="text-rose-600 hover:underline"
                                onClick={() => router.delete(`/invoices/${invoice.id}/attachments/${file.id}`)}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
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

            <Modal
                open={sendOpen}
                title="Send invoice"
                onClose={() => setSendOpen(false)}
                footer={
                    <Button disabled={send.processing} onClick={() => send.post(`/invoices/${invoice.id}/send`, { onSuccess: () => setSendOpen(false) })}>
                        Send
                    </Button>
                }
            >
                <div className="space-y-3">
                    <Input label="Email" type="email" value={send.data.email} onChange={(e) => send.setData('email', e.target.value)} error={send.errors.email} />
                    <Input label="Message" value={send.data.message} onChange={(e) => send.setData('message', e.target.value)} />
                </div>
            </Modal>
            <Modal
                open={reminderOpen}
                title="Payment reminder"
                onClose={() => setReminderOpen(false)}
                footer={
                    <Button disabled={reminder.processing} onClick={() => reminder.post(`/invoices/${invoice.id}/reminder`, { onSuccess: () => setReminderOpen(false) })}>
                        Send reminder
                    </Button>
                }
            >
                <div className="space-y-3">
                    <Input label="Email" type="email" value={reminder.data.email} onChange={(e) => reminder.setData('email', e.target.value)} error={reminder.errors.email} />
                    <Input label="Message" value={reminder.data.message} onChange={(e) => reminder.setData('message', e.target.value)} />
                </div>
            </Modal>
            <Modal
                open={payOpen}
                title="Record payment"
                onClose={() => setPayOpen(false)}
                footer={
                    <Button disabled={pay.processing} onClick={() => pay.post(`/invoices/${invoice.id}/payment`, { onSuccess: () => setPayOpen(false) })}>
                        Save payment
                    </Button>
                }
            >
                <div className="space-y-3">
                    <Input label="Amount" type="number" step="0.01" value={pay.data.amount} onChange={(e) => pay.setData('amount', e.target.value)} error={pay.errors.amount} />
                    <Input label="Date" type="date" value={pay.data.payment_date} onChange={(e) => pay.setData('payment_date', e.target.value)} error={pay.errors.payment_date} />
                    <Select label="Method" value={pay.data.payment_method} onChange={(e) => pay.setData('payment_method', e.target.value)} options={optionsFromMap(paymentMethods)} />
                    <Input label="Reference" value={pay.data.reference} onChange={(e) => pay.setData('reference', e.target.value)} />
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
