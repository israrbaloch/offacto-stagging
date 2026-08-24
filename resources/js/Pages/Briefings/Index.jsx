import { Link } from '@inertiajs/react';
import Icon from '../../Components/Icon';
import Pagination from '../../Components/Pagination';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { t } from '../../lib/i18n';
import { customerName, formatDate } from '../../lib/utils';

function statusTone(status) {
    if (status === 'active') return 'bg-emerald-50 text-emerald-700';
    if (status === 'closed') return 'bg-slate-100 text-slate-600';
    return 'bg-amber-50 text-amber-700';
}

export default function Index({ briefings }) {
    const rows = briefings?.data || [];

    return (
        <AuthenticatedLayout title={t('briefings.title')}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t('briefings.title')}</h1>
                    <p className="mt-1 text-sm text-slate-500">{t('briefings.subtitle')}</p>
                </div>
                <Link
                    href="/briefings/create"
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
                >
                    <Icon name="plus" className="h-4 w-4" />
                    {t('briefings.new')}
                </Link>
            </div>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                            <th className="px-5 py-3 font-medium">{t('briefings.title_col')}</th>
                            <th className="px-3 py-3 font-medium">{t('dashboard.customer')}</th>
                            <th className="px-3 py-3 font-medium">{t('common.status')}</th>
                            <th className="px-3 py-3 font-medium">{t('briefings.questions')}</th>
                            <th className="px-3 py-3 font-medium">{t('briefings.responses')}</th>
                            <th className="px-5 py-3 font-medium">{t('briefings.last_response')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                                    {t('briefings.empty')}
                                </td>
                            </tr>
                        )}
                        {rows.map((briefing) => (
                            <tr key={briefing.id} className="border-b border-slate-50 last:border-0">
                                <td className="px-5 py-4">
                                    <Link href={`/briefings/${briefing.id}/edit`} className="font-medium text-indigo-600 hover:text-indigo-700">
                                        {briefing.title || t('briefings.untitled')}
                                    </Link>
                                </td>
                                <td className="px-3 py-4 text-slate-600">{briefing.customer ? customerName(briefing.customer) : t('briefings.template')}</td>
                                <td className="px-3 py-4">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusTone(briefing.status)}`}>
                                        {briefing.status}
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-slate-500">{briefing.questions_count ?? 0}</td>
                                <td className="px-3 py-4">
                                    <Link href={`/briefings/${briefing.id}/responses`} className="text-indigo-600 hover:text-indigo-700">
                                        {briefing.responses_count ?? 0}
                                    </Link>
                                </td>
                                <td className="px-5 py-4 text-slate-500">{formatDate(briefing.responses_max_submitted_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-5 py-4">
                    <Pagination links={briefings?.links || []} />
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
