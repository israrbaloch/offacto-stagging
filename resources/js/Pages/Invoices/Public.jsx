import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import FlashToaster from '../../Components/FlashToaster';
import InvoiceDocumentPreview, { normalizeInvoiceTemplate } from '../../Components/InvoiceDocumentPreview';
import Logo from '../../Components/Logo';
import Modal from '../../Components/Modal';
import OfferBlockView from '../../Components/OfferBlockView';
import PdfPreviewModal from '../../Components/PdfPreviewModal';
import SignatureField from '../../Components/SignatureField';
import VoiceNoteField from '../../Components/VoiceNoteField';
import { DEFAULT_BRAND_PRIMARY, DEFAULT_BRAND_SECONDARY } from '../../lib/brand';
import { t } from '../../lib/i18n';
import { money } from '../../lib/utils';

export default function Public({ invoice, token, canAcknowledge }) {
    const [signature, setSignature] = useState('');
    const [pdfOpen, setPdfOpen] = useState(false);
    const [ackOpen, setAckOpen] = useState(false);
    const ack = useForm({ signature: '', signature_file: null, voice_note: null });
    const primary = invoice.company?.theme?.primary || DEFAULT_BRAND_PRIMARY;
    const secondary = invoice.company?.theme?.secondary || DEFAULT_BRAND_SECONDARY;

    useEffect(() => {
        document.documentElement.style.setProperty('--company-primary', primary);
        document.documentElement.style.setProperty('--company-secondary', secondary);
    }, [primary, secondary]);

    const submitAck = () => {
        ack.clearErrors();
        ack.setData('signature', signature);
        ack.post(`/i/${token}/acknowledge`, { forceFormData: true, onSuccess: () => setAckOpen(false) });
    };

    const blocksContent =
        (invoice.blocks || []).length > 0 ? (
            <div className="mt-8 space-y-4">
                {invoice.blocks.map((block) => (
                    <div key={block.id} className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 text-sm">
                        <OfferBlockView block={block} primary={primary} />
                    </div>
                ))}
            </div>
        ) : null;

    return (
        <div className="min-h-screen bg-slate-100">
            <Head title={`Invoice ${invoice.invoice_number || ''}`} />
            <FlashToaster />
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <div className="flex items-center gap-3">
                        {invoice.company?.logo_url ? (
                            <img src={invoice.company.logo_url} alt="" className="h-9 w-auto max-w-[140px] object-contain" />
                        ) : (
                            <Logo className="h-8 w-auto" />
                        )}
                        <div>
                            <div className="text-sm font-semibold text-slate-900">{invoice.company?.name}</div>
                            <div className="text-xs text-slate-400">Invoice {invoice.invoice_number}</div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {canAcknowledge && (
                            <button
                                type="button"
                                onClick={() => setAckOpen(true)}
                                className="rounded-full px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                                style={{ background: primary }}
                            >
                                {t('invoices.acknowledge_receipt')}
                            </button>
                        )}
                        {invoice.mollie_checkout_url && invoice.payment_status !== 'paid' && (
                            <a
                                href={invoice.mollie_checkout_url}
                                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                {t('invoices.pay_online')}
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => setPdfOpen(true)}
                            className="rounded-full border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
                            style={{ borderColor: primary, color: primary }}
                        >
                            {t('offers.preview_pdf')}
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8">
                {invoice.customer_acknowledged_at && (
                    <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {t('invoices.acknowledged_on', { date: new Date(invoice.customer_acknowledged_at).toLocaleString() })}
                    </div>
                )}
                {invoice.payment_status === 'paid' && (
                    <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{t('invoices.paid_banner')}</div>
                )}

                <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
                    <InvoiceDocumentPreview
                        template={normalizeInvoiceTemplate(invoice.company?.invoice_template)}
                        number={invoice.invoice_number}
                        date={invoice.invoice_date}
                        dueDate={invoice.due_date}
                        showMollieLink={Boolean(invoice.mollie_checkout_url)}
                        totalsOverride={{
                            subtotal: invoice.subtotal,
                            tax: invoice.tax_amount,
                            total: invoice.total,
                        }}
                        from={{
                            name: invoice.company?.name,
                            street: invoice.company?.street,
                            house: invoice.company?.house,
                            postal_code: invoice.company?.postal_code,
                            city: invoice.company?.city,
                            email: invoice.company?.email,
                        }}
                        to={{
                            name: invoice.customer?.name,
                            attn: invoice.customer?.attn,
                            address: invoice.customer?.address,
                            email: invoice.customer?.email,
                        }}
                        scope={invoice.desc || invoice.intro}
                        items={invoice.items || []}
                        notes={invoice.notes}
                        theme={invoice.company?.theme}
                        logoUrl={invoice.company?.logo_url}
                        middleContent={blocksContent}
                    />
                </div>
                {invoice.payment_status !== 'paid' && (
                    <p className="mt-4 text-center text-sm text-slate-600">
                        {t('invoices.amount_due_label')}: <strong>{money(invoice.amount_due)}</strong>
                    </p>
                )}
            </main>

            <Modal open={ackOpen} onClose={() => setAckOpen(false)} title={t('invoices.acknowledge_modal_title')} size="lg">
                <p className="mb-4 text-sm text-slate-600">{t('invoices.acknowledge_modal_hint')}</p>
                <SignatureField value={signature} onChange={setSignature} />
                <div className="mt-4">
                    <VoiceNoteField
                        value={ack.data.voice_note}
                        onChange={(file) => ack.setData('voice_note', file)}
                        error={ack.errors.voice_note}
                    />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button type="button" onClick={() => setAckOpen(false)} className="rounded-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={submitAck}
                        disabled={ack.processing}
                        className="rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                        style={{ background: primary }}
                    >
                        {t('invoices.acknowledge_confirm')}
                    </button>
                </div>
            </Modal>

            <PdfPreviewModal open={pdfOpen} onClose={() => setPdfOpen(false)} src={`/i/${token}/preview`} downloadHref={`/i/${token}/download`} />
        </div>
    );
}
