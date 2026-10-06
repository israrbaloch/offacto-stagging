import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import FlashToaster from '../../Components/FlashToaster';
import Logo from '../../Components/Logo';
import OfferBlockView from '../../Components/OfferBlockView';
import PdfPreviewModal from '../../Components/PdfPreviewModal';
import SafeHtml from '../../Components/SafeHtml';
import SignatureField from '../../Components/SignatureField';
import VoiceNoteField from '../../Components/VoiceNoteField';
import { t } from '../../lib/i18n';
import { money } from '../../lib/utils';

export default function Public({ offer, token, canRespond }) {
    const [signature, setSignature] = useState('');
    const [pdfOpen, setPdfOpen] = useState(false);
    const accept = useForm({ signature: '', signature_file: null, voice_note: null });
    const primary = offer.company?.theme?.primary || '#4054b2';
    const secondary = offer.company?.theme?.secondary || '#0f172a';

    useEffect(() => {
        document.documentElement.style.setProperty('--company-primary', primary);
        document.documentElement.style.setProperty('--company-secondary', secondary);
    }, [primary, secondary]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`Quotation ${offer.offer_number || ''}`} />
            <FlashToaster />
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
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
                    <button
                        type="button"
                        onClick={() => setPdfOpen(true)}
                        className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                        style={{ borderColor: primary, color: primary }}
                    >
                        {t('offers.preview_pdf')}
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
                    <div>
                        <h1 className="text-2xl font-semibold" style={{ color: secondary }}>
                            Quotation {offer.offer_number}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {offer.offer_date && `Date: ${offer.offer_date}`}
                            {offer.valid_until && ` · Valid until: ${offer.valid_until}`}
                        </p>
                    </div>

                    {offer.accepted_at && (
                        <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            Accepted on {new Date(offer.accepted_at).toLocaleString()}
                        </div>
                    )}
                    {offer.declined_at && (
                        <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
                            Declined on {new Date(offer.declined_at).toLocaleString()}
                        </div>
                    )}

                    <div className="prose prose-sm mt-8 max-w-none text-slate-700">
                        {offer.intro && <SafeHtml value={offer.intro} />}
                        {offer.desc && <SafeHtml value={offer.desc} />}
                    </div>

                    {(offer.blocks || []).length > 0 && (
                        <div className="mt-8 space-y-4">
                            {offer.blocks.map((block) => (
                                <div key={block.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
                                    <OfferBlockView block={block} primary={primary} />
                                </div>
                            ))}
                        </div>
                    )}

                    <table className="mt-8 w-full text-left text-sm">
                        <thead>
                            <tr className="text-white" style={{ background: secondary }}>
                                <th className="rounded-tl-xl px-3 py-2 font-medium">Item</th>
                                <th className="px-3 py-2 font-medium">Qty</th>
                                <th className="px-3 py-2 font-medium">Price</th>
                                <th className="rounded-tr-xl px-3 py-2 font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(offer.items || []).map((item, index) => (
                                <tr key={index} className="border-t border-slate-100">
                                    <td className="py-2 px-3">{item.description}</td>
                                    <td className="px-3">{item.quantity}</td>
                                    <td className="px-3">{money(item.unit_price)}</td>
                                    <td className="px-3">{money(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 text-right text-sm font-semibold" style={{ color: primary }}>
                        Total {money(offer.total)}
                    </div>

                    {canRespond && (
                        <div className="mt-10 space-y-4 border-t border-slate-100 pt-8">
                            <div>
                                <div className="mb-2 text-sm font-medium text-slate-700">{t('offers.signature_optional')}</div>
                                <SignatureField
                                    value={signature}
                                    onChange={setSignature}
                                    strokeColor={secondary}
                                    error={accept.errors.signature || accept.errors.signature_file}
                                />
                            </div>
                            <div>
                                <div className="mb-2 text-sm font-medium text-slate-700">{t('offers.voice_optional')}</div>
                                <VoiceNoteField
                                    value={accept.data.voice_note}
                                    onChange={(file) => accept.setData('voice_note', file)}
                                    error={accept.errors.voice_note}
                                />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        accept.clearErrors();
                                        accept.setData('signature', signature);
                                        accept.setData('signature_file', null);
                                        accept.post(`/q/${token}/accept`, { forceFormData: true });
                                    }}
                                    className="rounded-full px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                                    style={{ background: primary }}
                                >
                                    {t('offers.accept_quote')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.post(`/q/${token}/decline`)}
                                    className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    {t('offers.decline_quote')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

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
