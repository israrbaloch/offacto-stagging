import { Link, router } from '@inertiajs/react';
import { Fragment, useState } from 'react';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { customerName, formatDate } from '../../lib/utils';
import { t } from '../../lib/i18n';

export default function Responses({ briefing, responses = [], autoGenerateOffer = true }) {
    const [expandedId, setExpandedId] = useState(null);

    const generateQuote = (responseId) => {
        router.post(`/briefings/${briefing.id}/responses/${responseId}/generate-quote`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout title={`${briefing.title} responses`}>
            <div className="mb-6 flex items-center gap-3">
                <Link href={`/briefings/${briefing.id}/edit`} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100" aria-label="Back">
                    <Icon name="back" className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">{t('briefings.responses_title')}</h1>
                    <p className="text-sm text-slate-400">{briefing.title}</p>
                </div>
            </div>

            {!autoGenerateOffer && (
                <p className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {t('briefings.manual_generate_hint')}
                </p>
            )}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                            <th className="px-5 py-3 font-medium">{t('briefings.respondent')}</th>
                            <th className="px-3 py-3 font-medium">{t('briefings.submitted')}</th>
                            <th className="px-3 py-3 font-medium">{t('briefings.customer')}</th>
                            <th className="px-5 py-3 font-medium">{t('briefings.quotation')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {responses.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-slate-400">
                                    {t('briefings.no_responses')}
                                </td>
                            </tr>
                        )}
                        {responses.map((response) => (
                            <Fragment key={response.id}>
                                <tr className="border-b border-slate-50 last:border-0">
                                    <td className="px-5 py-4">
                                        <div className="font-medium text-slate-800">{response.respondent_name}</div>
                                        <div className="text-xs text-slate-400">{response.respondent_email}</div>
                                    </td>
                                    <td className="px-3 py-4 text-slate-500">{formatDate(response.submitted_at)}</td>
                                    <td className="px-3 py-4 text-slate-600">{response.customer ? customerName(response.customer) : '—'}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {response.offer ? (
                                                <Link href={`/offers/${response.offer.id}/edit`} className="font-medium text-indigo-600">
                                                    {response.offer.offer_number} · {response.offer.status_relation?.name || 'Draft'}
                                                </Link>
                                            ) : (
                                                <>
                                                    <span className="text-slate-400">{t('briefings.no_draft')}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => generateQuote(response.id)}
                                                        className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                                                    >
                                                        {t('briefings.generate_quote')}
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setExpandedId(expandedId === response.id ? null : response.id)}
                                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                            >
                                                {expandedId === response.id ? t('briefings.hide_answers') : t('briefings.view_answers')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedId === response.id && (
                                    <tr className="bg-slate-50">
                                        <td colSpan="4" className="px-5 py-4">
                                            <div className="space-y-2">
                                                {(response.answers || []).length === 0 && (
                                                    <p className="text-sm text-slate-400">{t('briefings.no_answers')}</p>
                                                )}
                                                {(response.answers || []).map((answer) => (
                                                    <div key={answer.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{answer.question_label}</div>
                                                        <div className="mt-1 text-sm text-slate-800">
                                                            {answer.display || answer.file_name || '—'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </section>
        </AuthenticatedLayout>
    );
}
