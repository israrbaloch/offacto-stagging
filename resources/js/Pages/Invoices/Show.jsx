import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../../Components/Button';
import Input, { Select } from '../../Components/Input';
import Modal from '../../Components/Modal';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { customerName, formatDate, money, optionsFromMap } from '../../lib/utils';

export default function Show({ invoice, paymentMethods = {} }) {
    const [sendOpen, setSendOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);
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
