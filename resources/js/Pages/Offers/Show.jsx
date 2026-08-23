import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import Modal from '../../Components/Modal';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { customerName, formatDate, money } from '../../lib/utils';

export default function Show({ offer }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        email: offer.customer?.email || '',
        subject: `Offer ${offer.offer_number}`,
        message: '',
    });

    return (
        <AuthenticatedLayout title={offer.offer_number}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">{offer.offer_number}</h1>
                    <p className="text-sm text-slate-500">
                        {customerName(offer.customer)} · {formatDate(offer.offer_date)} · {offer.status_relation?.name}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button href={`/offers/${offer.id}/edit`} variant="secondary">
                        Edit
                    </Button>
                    <Button href={`/invoices/from-offer/${offer.id}`} variant="secondary">
                        Create invoice
                    </Button>
                    <Button onClick={() => setOpen(true)}>Send</Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            if (confirm('Delete this offer?')) router.delete(`/offers/${offer.id}`);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="whitespace-pre-wrap text-sm text-slate-600">{offer.intro}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm">{offer.desc}</p>
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
                        {(offer.items || []).map((item) => (
                            <tr key={item.id} className="border-t border-slate-100">
                                <td className="py-2">{item.service?.name || item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{money(item.price)}</td>
                                <td>{money(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 text-right font-semibold">Total {money(offer.total)}</div>
            </div>
            <Modal
                open={open}
                title="Send offer"
                onClose={() => setOpen(false)}
                footer={
                    <Button
                        disabled={form.processing}
                        onClick={() => form.post(`/offers/${offer.id}/send`, { onSuccess: () => setOpen(false) })}
                    >
                        Send
                    </Button>
                }
            >
                <div className="space-y-3">
                    <Input label="Email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                    <Input label="Subject" value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} />
                    <Input label="Message" value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} />
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
