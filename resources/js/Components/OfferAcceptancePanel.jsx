import { Link } from '@inertiajs/react';
import { t } from '../lib/i18n';
import { formatDate } from '../lib/utils';

function isSignatureImage(value) {
    return typeof value === 'string' && value.startsWith('data:image/');
}

export default function OfferAcceptancePanel({ offer, compact = false }) {
    if (!offer?.accepted_at && !offer?.declined_at) {
        return null;
    }

    const hasSignature = isSignatureImage(offer.signature_data);
    const hasVoice = Boolean(offer.voice_note_url);

    if (offer.accepted_at && !hasSignature && !hasVoice) {
        if (compact) {
            return null;
        }
    }

    if (offer.declined_at && !offer.accepted_at) {
        return (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">
                {t('offers.declined_on', { date: formatDate(offer.declined_at) })}
            </div>
        );
    }

    if (!offer.accepted_at) {
        return null;
    }

    const inner = (
        <>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">{t('offers.acceptance_title')}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">{t('offers.acceptance_subtitle', { date: formatDate(offer.accepted_at) })}</p>
                </div>
                {!compact && offer.id && hasVoice && (
                    <Link
                        href={`/offers/${offer.id}/voice-note`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        {t('offers.voice_download')}
                    </Link>
                )}
            </div>

            <div className={`mt-4 grid gap-4 ${hasSignature && hasVoice ? 'md:grid-cols-2' : ''}`}>
                {hasSignature && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{t('offers.signature_label')}</div>
                        <img
                            src={offer.signature_data}
                            alt={t('offers.signature_label')}
                            className="max-h-40 w-full rounded-lg border border-white bg-white object-contain"
                        />
                    </div>
                )}
                {hasVoice && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{t('offers.voice_label')}</div>
                        <audio controls preload="metadata" className="w-full" src={offer.voice_note_url}>
                            {t('offers.voice_unsupported')}
                        </audio>
                        {compact && offer.id && (
                            <Link href={`/offers/${offer.id}/voice-note`} className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                {t('offers.voice_download')}
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {offer.accepted_at && !hasSignature && !hasVoice && !compact && (
                <p className="mt-3 text-sm text-slate-500">{t('offers.acceptance_no_artifacts')}</p>
            )}
        </>
    );

    if (compact) {
        return <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">{inner}</div>;
    }

    return <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{inner}</section>;
}
