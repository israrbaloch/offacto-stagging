import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { t } from '../../../lib/i18n';
import { formatDate } from '../../../lib/utils';

export default function SupportTicketShow({ ticket, messages = [] }) {
    const form = useForm({ body: '' });

    return (
        <AuthenticatedLayout title={ticket.subject}>
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <Link href="/support" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        ← {t('support.back_to_list')}
                    </Link>
                    <h1 className="mt-2 text-xl font-semibold text-slate-900">{ticket.subject}</h1>
                    <p className="mt-1 text-xs text-slate-500">
                        {ticket.reference} · {t('support.status')}: {ticket.status} · {formatDate(ticket.created_at)}
                    </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`rounded-xl px-4 py-3 text-sm ${msg.is_staff ? 'bg-slate-100 text-slate-800' : 'bg-indigo-50 text-slate-900'}`}
                        >
                            <p className="mb-1 text-xs font-semibold text-slate-500">
                                {msg.author} · {formatDate(msg.created_at)}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.body}</p>
                        </div>
                    ))}
                </div>

                {ticket.status !== 'closed' && (
                    <form
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.post(`/support/tickets/${ticket.id}/messages`, { preserveScroll: true, onSuccess: () => form.reset('body') });
                        }}
                    >
                        <label className="mb-2 block text-sm font-medium text-slate-700">{t('support.reply')}</label>
                        <textarea
                            className="min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            value={form.data.body}
                            onChange={(e) => form.setData('body', e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="mt-3 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            {t('support.send_reply')}
                        </button>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
