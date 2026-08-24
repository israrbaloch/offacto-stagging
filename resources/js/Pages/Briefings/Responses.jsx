import { Link } from '@inertiajs/react';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { customerName, formatDate } from '../../lib/utils';

export default function Responses({ briefing, responses = [] }) {
    return (
        <AuthenticatedLayout title={`${briefing.title} responses`}>
            <div className="mb-6 flex items-center gap-3">
                <Link href={`/briefings/${briefing.id}/edit`} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100" aria-label="Back">
                    <Icon name="back" className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Responses</h1>
                    <p className="text-sm text-slate-400">{briefing.title}</p>
                </div>
            </div>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                            <th className="px-5 py-3 font-medium">Respondent</th>
                            <th className="px-3 py-3 font-medium">Submitted</th>
                            <th className="px-3 py-3 font-medium">Customer</th>
                            <th className="px-5 py-3 font-medium">Quotation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {responses.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-slate-400">
                                    No responses yet.
                                </td>
                            </tr>
                        )}
                        {responses.map((response) => (
                            <tr key={response.id} className="border-b border-slate-50 last:border-0">
                                <td className="px-5 py-4">
                                    <div className="font-medium text-slate-800">{response.respondent_name}</div>
                                    <div className="text-xs text-slate-400">{response.respondent_email}</div>
                                </td>
                                <td className="px-3 py-4 text-slate-500">{formatDate(response.submitted_at)}</td>
                                <td className="px-3 py-4 text-slate-600">{response.customer ? customerName(response.customer) : '—'}</td>
                                <td className="px-5 py-4">
                                    {response.offer ? (
                                        <Link href={`/offers/${response.offer.id}/edit`} className="font-medium text-indigo-600">
                                            {response.offer.offer_number} · {response.offer.status_relation?.name || 'Draft'}
                                        </Link>
                                    ) : (
                                        <span className="text-slate-400">No draft yet</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </AuthenticatedLayout>
    );
}
