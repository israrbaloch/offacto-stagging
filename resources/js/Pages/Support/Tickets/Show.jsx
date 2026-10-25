import { Link, useForm } from '@inertiajs/react';
import Icon from '../../../Components/Icon';
import SupportMessageAttachments from '../../../Components/SupportMessageAttachments';
import SupportTicketImagePicker from '../../../Components/SupportTicketImagePicker';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { t } from '../../../lib/i18n';
import { formatDate } from '../../../lib/utils';

function ticketStatusBadgeClass(status) {
    const key = String(status || '').toLowerCase();
    if (key === 'closed') {
        return 'grey';
    }
    if (key === 'open' || key === 'new') {
        return 'ok';
    }
    if (key === 'pending' || key === 'waiting') {
        return 'warn';
    }
    return '';
}

export default function SupportTicketShow({ ticket, messages = [] }) {
    const form = useForm({ body: '', images: [] });

    return (
        <AuthenticatedLayout title={ticket.subject}>
            <div className="offacto-briefings offacto-dash offacto-support-page">
                <div className="offacto-brief-edit-ph">
                    <Link href="/support" className="offacto-brief-edit-crumb">
                        <Icon name="back" />
                        {t('support.back_to_list')}
                    </Link>
                    <h1>
                        {ticket.subject}{' '}
                        <span className={`offacto-demo-badge nd ${ticketStatusBadgeClass(ticket.status)}`}>
                            {ticket.status}
                        </span>
                    </h1>
                    <p>
                        {ticket.reference} · {t('support.status')}: {ticket.status} · {formatDate(ticket.created_at)}
                    </p>
                </div>

                <div className="offacto-support-stack">
                    <div className="offacto-dash-card offacto-support-thread-card">
                        <div className="offacto-dash-card-head">
                            <h3>{t('support.message')}</h3>
                        </div>
                        <div className="offacto-dash-card-body offacto-support-thread">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`offacto-support-msg ${msg.is_staff ? 'is-staff' : 'is-user'}`}
                                >
                                    <p className="offacto-support-msg-meta">
                                        {msg.author} · {formatDate(msg.created_at)}
                                    </p>
                                    <p className="offacto-support-msg-body">{msg.body}</p>
                                    <SupportMessageAttachments attachments={msg.attachments} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {ticket.status !== 'closed' && (
                        <div className="offacto-dash-card">
                            <div className="offacto-dash-card-head">
                                <h3>{t('support.reply')}</h3>
                            </div>
                            <div className="offacto-dash-card-body">
                                <form
                                    className="offacto-support-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        form.post(`/support/tickets/${ticket.id}/messages`, {
                                            forceFormData: true,
                                            preserveScroll: true,
                                            onSuccess: () => form.reset(),
                                        });
                                    }}
                                >
                                    <label className="offacto-brief-edit-lbl">
                                        {t('support.reply')}
                                        <textarea
                                            className="offacto-brief-inp"
                                            value={form.data.body}
                                            onChange={(e) => form.setData('body', e.target.value)}
                                            required
                                        />
                                    </label>
                                    <SupportTicketImagePicker
                                        compact
                                        files={form.data.images}
                                        onChange={(images) => form.setData('images', images)}
                                    />
                                    <div className="offacto-support-form-actions">
                                        <button type="submit" disabled={form.processing} className="offacto-btn-p">
                                            <Icon name="send" />
                                            {t('support.send_reply')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
