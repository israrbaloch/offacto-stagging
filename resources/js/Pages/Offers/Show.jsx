import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import Modal from '../../Components/Modal';
import OfferPreview from '../../Components/OfferPreview';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { customerName, formatDate } from '../../lib/utils';

export default function Show({ offer }) {
    const { activeCompany } = usePage().props;
    const [open, setOpen] = useState(false);
    const form = useForm({
        email: offer.customer?.email || '',
        subject: `Offer ${offer.offer_number}`,
        message: offer.email_message || '',
    });
    const status = String(offer.status_relation?.name || '').toLowerCase();
    const isSent = ['sent', 'accepted', 'invoiced'].includes(status);
    const company = offer.company || activeCompany || {};
    const customer = offer.customer || {};

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
                    {isSent && (
                        <>
                            <Button href={`/offers/${offer.id}/preview`} as="a" variant="secondary">
                                Preview PDF
                            </Button>
                            <Button href={`/offers/${offer.id}/download`} as="a" variant="secondary">
                                Download PDF
                            </Button>
                        </>
                    )}
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
            {!isSent && (
                <p className="mb-3 text-sm text-slate-500">
                    On-screen preview — the PDF file is created when you send this offer.
                </p>
            )}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <OfferPreview
                    number={offer.offer_number}
                    date={offer.offer_date}
                    validUntil={offer.valid_until}
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
                    scope={offer.desc || offer.intro}
                    items={(offer.items || []).map((item) => ({
                        service_name: item.service?.name,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                    }))}
                    notes={offer.notes}
                    sender={{
                        name: [company.first_name, company.surname].filter(Boolean).join(' '),
                        title: company.self_employed_activity,
                    }}
                    client={{
                        name: [customer.first_name, customer.surname].filter(Boolean).join(' '),
                    }}
                    theme={activeCompany?.theme}
                    logoUrl={activeCompany?.invoice_logo_url}
                    vatRate={21}
                />
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
