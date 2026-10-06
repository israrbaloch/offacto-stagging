import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../../Components/Button';
import PostbodeSendModal from '../../Components/PostbodeSendModal';
import SendOfferModal from '../../Components/SendOfferModal';
import OfferAcceptancePanel from '../../Components/OfferAcceptancePanel';
import OfferPreview from '../../Components/OfferPreview';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { useUi } from '../../context/UiContext';
import { t } from '../../lib/i18n';
import { customerName, formatDate } from '../../lib/utils';

export default function Show({ offer, postbodeConfigured = false, publicQuoteUrl = '' }) {
    const { activeCompany } = usePage().props;
    const { confirm } = useUi();
    const [sendOpen, setSendOpen] = useState(false);
    const [postbodeOpen, setPostbodeOpen] = useState(false);
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
                    <Button onClick={() => setSendOpen(true)}>Send</Button>
                    {isSent && postbodeConfigured && (
                        <Button variant="secondary" onClick={() => setPostbodeOpen(true)}>
                            {t('integrations.postbode_send_short')}
                        </Button>
                    )}
                    <Button
                        variant="danger"
                        onClick={async () => {
                            if (
                                await confirm({
                                    message: t('offers.delete_confirm'),
                                    confirmLabel: t('common.delete'),
                                    danger: true,
                                })
                            ) {
                                router.delete(`/offers/${offer.id}`);
                            }
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
            {offer.postbode_sent_at && (
                <p className="mb-3 text-sm text-emerald-700">
                    {t('integrations.postbode_sent', { date: formatDate(offer.postbode_sent_at) })}
                    {offer.postbode_status ? ` · ${offer.postbode_status}` : ''}
                </p>
            )}
            <OfferAcceptancePanel offer={offer} />
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
            <SendOfferModal
                open={sendOpen}
                onClose={() => setSendOpen(false)}
                offerId={offer.id}
                defaultEmail={offer.customer?.email || ''}
                defaultMessage={offer.email_message || ''}
                publicUrl={publicQuoteUrl}
                postbodeConfigured={postbodeConfigured}
            />
            <PostbodeSendModal
                open={postbodeOpen}
                onClose={() => setPostbodeOpen(false)}
                actionUrl={`/offers/${offer.id}/postbode`}
                documentLabel={offer.offer_number}
            />
        </AuthenticatedLayout>
    );
}
