import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Button from '../../Components/Button';
import FlashToaster from '../../Components/FlashToaster';
import Logo from '../../Components/Logo';
import Modal from '../../Components/Modal';
import OfferBlockView from '../../Components/OfferBlockView';
import OfferPreview from '../../Components/OfferPreview';
import PdfPreviewModal from '../../Components/PdfPreviewModal';
import SignatureField from '../../Components/SignatureField';
import VoiceNoteField from '../../Components/VoiceNoteField';
import { DEFAULT_BRAND_PRIMARY, DEFAULT_BRAND_SECONDARY } from '../../lib/brand';
import { t } from '../../lib/i18n';

export default function Public({ offer, token, canRespond }) {
    const [signature, setSignature] = useState('');
    const [pdfOpen, setPdfOpen] = useState(false);
    const [acceptOpen, setAcceptOpen] = useState(false);
    const [acceptTab, setAcceptTab] = useState('sign');
    const accept = useForm({ signature: '', signature_file: null, voice_note: null });
    const primary = offer.company?.theme?.primary || DEFAULT_BRAND_PRIMARY;
    const secondary = offer.company?.theme?.secondary || DEFAULT_BRAND_SECONDARY;

    useEffect(() => {
        document.documentElement.style.setProperty('--company-primary', primary);
        document.documentElement.style.setProperty('--company-secondary', secondary);
    }, [primary, secondary]);

    const submitAcceptance = () => {
        accept.clearErrors();
        accept.setData('signature', signature);
        accept.setData('signature_file', null);
        accept.post(`/q/${token}/accept`, {
            forceFormData: true,
            onSuccess: () => setAcceptOpen(false),
        });
    };

    const blocksContent =
        (offer.blocks || []).length > 0 ? (
            <div className="mt-8 space-y-4">
                {offer.blocks.map((block) => (
                    <div key={block.id} className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 text-sm">
                        <OfferBlockView block={block} primary={primary} />
                    </div>
                ))}
            </div>
        ) : null;

    return (
        <div className="min-h-screen bg-slate-100">
            <Head title={`Quotation ${offer.offer_number || ''}`} />
            <FlashToaster />
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <div className="flex items-center gap-3">
                        {offer.company?.logo_url ? (
                            <img src={offer.company.logo_url} alt="" className="h-9 w-auto max-w-[140px] object-contain" />
                        ) : (
                            <Logo className="h-8 w-auto" />
                        )}
                        <div>
                            <div className="text-sm font-semibold text-slate-900">{offer.company?.name}</div>
                            <div className="text-xs text-slate-400">Quotation {offer.offer_number}</div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {canRespond && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAcceptTab('sign');
                                        setAcceptOpen(true);
                                    }}
                                    className="rounded-full px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                                    style={{ background: primary }}
                                >
                                    {t('offers.accept_quote')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.post(`/q/${token}/decline`)}
                                    className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    {t('offers.decline_quote')}
                                </button>
                            </>
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
                {offer.accepted_at && (
                    <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        Accepted on {new Date(offer.accepted_at).toLocaleString()}
                    </div>
                )}
                {offer.declined_at && (
                    <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        Declined on {new Date(offer.declined_at).toLocaleString()}
                    </div>
                )}

                <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
                    <OfferPreview
                        number={offer.offer_number}
                        date={offer.offer_date}
                        validUntil={offer.valid_until}
                        from={{
                            name: offer.company?.name,
                            street: offer.company?.street,
                            house: offer.company?.house,
                            postal_code: offer.company?.postal_code,
                            city: offer.company?.city,
                            email: offer.company?.email,
                        }}
                        to={{
                            name: offer.customer?.name,
                            attn: offer.customer?.attn,
                            address: offer.customer?.address,
                            email: offer.customer?.email,
                        }}
                        scope={[offer.intro, offer.desc].filter(Boolean).join('\n\n') || undefined}
                        items={offer.items || []}
                        notes={offer.notes}
                        paymentTerms={offer.payment_terms}
                        totalsOverride={{
                            subtotal: offer.subtotal,
                            tax: offer.tax_amount,
                            total: offer.total,
                        }}
                        theme={offer.company?.theme}
                        logoUrl={offer.company?.logo_url}
                        middleContent={blocksContent}
                    />
                </div>
            </main>

            <Modal
                open={acceptOpen}
                size="lg"
                title={t('offers.accept_modal_title')}
                onClose={() => setAcceptOpen(false)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setAcceptOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button disabled={accept.processing} onClick={submitAcceptance}>
                            {t('offers.accept_modal_confirm')}
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-slate-600">{t('offers.accept_modal_hint')}</p>

                <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('offers.accept_step_choose')}</p>
                    <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={acceptTab === 'sign'}
                            onClick={() => setAcceptTab('sign')}
                            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                acceptTab === 'sign'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {t('offers.accept_tab_sign')}
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={acceptTab === 'voice'}
                            onClick={() => setAcceptTab('voice')}
                            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                acceptTab === 'voice'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {t('offers.accept_tab_voice')}
                        </button>
                    </div>
                </div>

                <div
                    className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5"
                    role="region"
                    aria-label={acceptTab === 'sign' ? t('offers.accept_tab_sign') : t('offers.accept_tab_voice')}
                >
                    {acceptTab === 'sign' && (
                        <>
                            <p className="mb-4 text-sm font-medium text-slate-800">{t('offers.accept_sign_subtitle')}</p>
                            <SignatureField
                                nested
                                value={signature}
                                onChange={setSignature}
                                strokeColor={secondary}
                                error={accept.errors.signature || accept.errors.signature_file}
                            />
                        </>
                    )}
                    {acceptTab === 'voice' && (
                        <>
                            <p className="mb-4 text-sm font-medium text-slate-800">{t('offers.accept_voice_subtitle')}</p>
                            <VoiceNoteField
                                nested
                                value={accept.data.voice_note}
                                onChange={(file) => accept.setData('voice_note', file)}
                                error={accept.errors.voice_note}
                            />
                        </>
                    )}
                </div>
            </Modal>

            <PdfPreviewModal
                open={pdfOpen}
                onClose={() => setPdfOpen(false)}
                previewUrl={`/q/${token}/preview`}
                downloadUrl={`/q/${token}/download`}
                title={t('offers.pdf_preview_title')}
            />
        </div>
    );
}
