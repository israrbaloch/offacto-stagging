import { Link } from '@inertiajs/react';
import { t } from '../lib/i18n';
import { formatDate } from '../lib/utils';

function isSignatureImage(value) {
    return typeof value === 'string' && value.startsWith('data:image/');
}

export default function InvoiceAcknowledgmentPanel({ invoice, compact = false }) {
    if (!invoice?.customer_acknowledged_at) {
        return null;
    }

    const hasSignature = isSignatureImage(invoice.signature_data);
    const hasVoice = Boolean(invoice.voice_note_url);

    const inner = (
        <>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">{t('invoices.acknowledgment_title')}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {t('invoices.acknowledgment_subtitle', { date: formatDate(invoice.customer_acknowledged_at) })}
                    </p>
                </div>
                {!compact && invoice.id && hasVoice && (
                    <Link href={`/invoices/${invoice.id}/voice-note`} className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                        {t('offers.voice_download')}
                    </Link>
                )}
            </div>
            <div className={`mt-4 grid gap-4 ${hasSignature && hasVoice ? 'md:grid-cols-2' : ''}`}>
                {hasSignature && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{t('offers.signature_label')}</div>
                        <img src={invoice.signature_data} alt="" className="max-h-40 w-full rounded-lg border border-white bg-white object-contain" />
                    </div>
                )}
                {hasVoice && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{t('offers.voice_label')}</div>
                        <audio controls preload="metadata" className="w-full" src={invoice.voice_note_url}>
                            {t('offers.voice_unsupported')}
                        </audio>
                    </div>
                )}
            </div>
            {!hasSignature && !hasVoice && !compact && (
                <p className="mt-3 text-sm text-slate-500">{t('invoices.acknowledgment_no_artifacts')}</p>
            )}
        </>
    );

    if (compact) {
        return <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">{inner}</div>;
    }

    return <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{inner}</section>;
}
