import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { t } from '../../../lib/i18n';
import { formatDate } from '../../../lib/utils';

export default function SupportTicketsIndex({ tickets = [], company }) {
    const form = useForm({
        subject: '',
        description: '',
        priority: 'normal',
    });

    return (
        <AuthenticatedLayout title={t('support.title')}>
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">{t('support.title')}</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {t('support.tickets_intro', { company: company?.name || '' })}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-900">{t('support.new_ticket')}</h2>
                    <form
                        className="mt-4 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.post('/support/tickets');
                        }}
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">{t('support.subject')}</label>
                            <input
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                value={form.data.subject}
                                onChange={(e) => form.setData('subject', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">{t('support.message')}</label>
                            <textarea
                                className="min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">{t('support.priority')}</label>
                            <select
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                value={form.data.priority}
                                onChange={(e) => form.setData('priority', e.target.value)}
                            >
                                <option value="low">{t('support.priority_low')}</option>
                                <option value="normal">{t('support.priority_normal')}</option>
                                <option value="high">{t('support.priority_high')}</option>
                                <option value="urgent">{t('support.priority_urgent')}</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {t('support.submit_ticket')}
                        </button>
                    </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <h2 className="border-b border-slate-100 px-6 py-4 text-sm font-semibold text-slate-900">{t('support.your_tickets')}</h2>
                    {tickets.length === 0 ? (
                        <p className="px-6 py-8 text-sm text-slate-500">{t('support.no_tickets')}</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {tickets.map((row) => (
                                <li key={row.id}>
                                    <Link href={`/support/tickets/${row.id}`} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 hover:bg-slate-50">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{row.subject}</p>
                                            <p className="text-xs text-slate-500">
                                                {row.reference} · {formatDate(row.updated_at)}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">{row.status}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
