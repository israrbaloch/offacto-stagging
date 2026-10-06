import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { t } from '../lib/i18n';

const CHANNELS = [
    { id: 'email', labelKey: 'offers.channel_email' },
    { id: 'whatsapp', labelKey: 'offers.channel_whatsapp' },
    { id: 'postbode', labelKey: 'offers.channel_postbode' },
];

export default function SendOfferModal({
    open,
    onClose,
    offerId,
    defaultEmail = '',
    defaultMessage = '',
    publicUrl = '',
    postbodeConfigured = false,
    legalDocumentIds = [],
    onBeforeSend,
}) {
    const [channelError, setChannelError] = useState('');
    const form = useForm({
        email: defaultEmail,
        message: defaultMessage,
        channels: ['email'],
        legal_document_ids: legalDocumentIds,
        registered: false,
    });

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

    const submit = () => {
        if (!offerId) return;
        if (form.data.channels.length === 0) {
            setChannelError(t('offers.channel_required'));
            return;
        }
        if (form.data.channels.includes('email') && !form.data.email?.trim()) {
            form.setError('email', t('offers.send_need_email'));
            return;
        }
        if (form.data.channels.includes('postbode') && !postbodeConfigured) {
            setChannelError(t('integrations.postbode_missing'));
            return;
        }

        const runSend = () => {
            form.post(`/offers/${offerId}/send`, {
                preserveScroll: true,
                onSuccess: () => {
                    if (form.data.channels.includes('whatsapp') && publicUrl) {
                        const text = encodeURIComponent(t('offers.whatsapp_prefill', { url: publicUrl }));
                        window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
                    }
                    onClose();
                },
            });
        };

        if (onBeforeSend) {
            onBeforeSend(runSend);
        } else {
            runSend();
        }
    };

    return (
        <Modal open={open} title={t('offers.send_modal_title')} onClose={onClose}>
            <p className="text-sm text-slate-600">{t('offers.send_modal_hint')}</p>

            <fieldset className="mt-4 space-y-2">
                <legend className="text-sm font-medium text-slate-800">{t('offers.channels_label')}</legend>
                {CHANNELS.map((channel) => {
                    const disabled = channel.id === 'postbode' && !postbodeConfigured;
                    return (
                        <label
                            key={channel.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 ${disabled ? 'cursor-not-allowed opacity-50' : 'border-slate-200 hover:bg-slate-50'}`}
                        >
                            <input
                                type="checkbox"
                                className="mt-0.5"
                                checked={form.data.channels.includes(channel.id)}
                                disabled={disabled}
                                onChange={() => toggleChannel(channel.id)}
                            />
                            <span>
                                <span className="block text-sm font-medium text-slate-800">{t(channel.labelKey)}</span>
                                {channel.id === 'postbode' && !postbodeConfigured && (
                                    <span className="text-xs text-slate-500">{t('offers.channel_postbode_disabled')}</span>
                                )}
                            </span>
                        </label>
                    );
                })}
                {channelError && <p className="text-xs text-rose-600">{channelError}</p>}
            </fieldset>

            {form.data.channels.includes('email') && (
                <div className="mt-4 space-y-3">
                    <Input label={t('common.email')} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                    <Input label={t('offers.send_message_label')} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} />
                    <p className="text-xs text-slate-500">{t('offers.email_link_hint')}</p>
                </div>
            )}

            {form.data.channels.includes('postbode') && postbodeConfigured && (
                <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.data.registered} onChange={(e) => form.setData('registered', e.target.checked)} className="mt-1" />
                    <span>{t('integrations.postbode_registered_shipment')}</span>
                </label>
            )}

            <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>
                    {t('common.cancel')}
                </Button>
                <Button disabled={form.processing} onClick={submit}>
                    {t('offers.send_confirm')}
                </Button>
            </div>
        </Modal>
    );
}
