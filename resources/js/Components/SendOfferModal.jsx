import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import EmailRecipientsField from './EmailRecipientsField';
import { TextArea } from './Input';
import Modal from './Modal';
import { t } from '../lib/i18n';

const CHANNELS = [
    { id: 'email', labelKey: 'offers.channel_email' },
    { id: 'postbode', labelKey: 'offers.channel_postbode' },
];

function parseDefaultEmails(defaultEmail) {
    if (!defaultEmail || typeof defaultEmail !== 'string') {
        return [];
    }
    return defaultEmail
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
}

export default function SendOfferModal({
    open,
    onClose,
    offerId,
    defaultEmail = '',
    defaultMessage = '',
    legalDocumentIds = [],
    onBeforeSend,
}) {
    const [channelError, setChannelError] = useState('');
    const form = useForm({
        emails: parseDefaultEmails(defaultEmail),
        message: defaultMessage,
        channels: ['email'],
        legal_document_ids: legalDocumentIds,
        registered: false,
    });

    const wasOpen = useRef(false);
    useEffect(() => {
        if (open && !wasOpen.current) {
            setChannelError('');
            form.setData({
                emails: parseDefaultEmails(defaultEmail),
                message: defaultMessage,
                channels: ['email'],
                legal_document_ids: legalDocumentIds,
                registered: false,
            });
            form.clearErrors();
        }
        wasOpen.current = open;
    }, [open, defaultEmail, defaultMessage, legalDocumentIds]);

    const toggleChannel = (id) => {
        setChannelError('');
        const current = form.data.channels;
        if (current.includes(id)) {
            if (current.length === 1) {
                setChannelError(t('offers.channel_required'));
                return;
            }
            form.setData(
                'channels',
                current.filter((c) => c !== id),
            );
        } else {
            form.setData('channels', [...current, id]);
        }
    };

    const emailError =
        form.errors.emails ||
        form.errors['emails.0'] ||
        (typeof form.errors.email === 'string' ? form.errors.email : null);

    const submit = () => {
        if (!offerId) return;
        if (form.data.channels.length === 0) {
            setChannelError(t('offers.channel_required'));
            return;
        }
        if (form.data.channels.includes('email') && form.data.emails.length === 0) {
            form.setError('emails', t('offers.send_emails_required'));
            return;
        }

        const runSend = () => {
            form.post(`/offers/${offerId}/send`, {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        };

        if (onBeforeSend) {
            onBeforeSend(runSend);
        } else {
            runSend();
        }
    };

    const showEmail = form.data.channels.includes('email');
    const showPostbode = form.data.channels.includes('postbode');

    return (
        <Modal
            open={open}
            size="lg"
            title={t('offers.send_modal_title')}
            onClose={onClose}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button disabled={form.processing} onClick={submit}>
                        {t('offers.send_confirm')}
                    </Button>
                </>
            }
        >
            <p className="text-sm leading-relaxed text-slate-600">{t('offers.send_modal_hint')}</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">{t('offers.channels_label')}</h3>
                    <ul className="mt-3 space-y-2">
                        {CHANNELS.map((channel) => (
                            <li key={channel.id}>
                                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 hover:border-slate-300">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5"
                                        checked={form.data.channels.includes(channel.id)}
                                        onChange={() => toggleChannel(channel.id)}
                                    />
                                    <span className="text-sm font-medium text-slate-800">{t(channel.labelKey)}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                    {channelError && <p className="mt-2 text-xs text-rose-600">{channelError}</p>}

                    {showPostbode && (
                        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                            <label className="flex items-start gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={form.data.registered}
                                    onChange={(e) => form.setData('registered', e.target.checked)}
                                    className="mt-1"
                                />
                                <span>{t('integrations.postbode_registered_shipment')}</span>
                            </label>
                        </div>
                    )}
                </section>

                {showEmail ? (
                    <section className="rounded-xl border border-slate-200 bg-white p-4 lg:min-h-[280px]">
                        <h3 className="text-sm font-semibold text-slate-900">{t('offers.send_email_section')}</h3>
                        <div className="mt-4 space-y-4">
                            <EmailRecipientsField
                                label={t('offers.send_emails_label')}
                                value={form.data.emails}
                                onChange={(emails) => form.setData('emails', emails)}
                                error={emailError}
                            />
                            <TextArea
                                label={t('offers.send_message_label')}
                                rows={8}
                                value={form.data.message}
                                onChange={(e) => form.setData('message', e.target.value)}
                                className="font-mono text-[13px] leading-relaxed"
                            />
                            <p className="text-xs leading-relaxed text-slate-500">{t('offers.email_link_hint')}</p>
                        </div>
                    </section>
                ) : (
                    <section className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center lg:min-h-[280px]">
                        <p className="max-w-xs text-sm text-slate-500">{t('offers.send_email_section_off')}</p>
                    </section>
                )}
            </div>
        </Modal>
    );
}
