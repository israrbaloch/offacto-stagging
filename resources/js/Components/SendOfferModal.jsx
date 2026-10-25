import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { SendChannelBadgeIcon } from './SendModalUi';
import { t } from '../lib/i18n';

function parseDefaultEmails(defaultEmail) {
    if (!defaultEmail || typeof defaultEmail !== 'string') {
        return [];
    }
    return defaultEmail
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
}

const OFFER_SEND_CHANNELS = [
    {
        id: 'peppol',
        icon: 'peppol',
        color: '#2B3580',
        titleKey: 'send_modal.channel_peppol',
        subtitleKey: 'send_modal.channel_peppol_sub',
        quoteDisabled: true,
    },
    {
        id: 'email',
        icon: 'email',
        color: '#3A4AA0',
        titleKey: 'send_modal.channel_email',
        subtitleKey: 'send_modal.channel_email_quote_sub',
    },
    {
        id: 'whatsapp',
        icon: 'whatsapp',
        color: '#15803D',
        titleKey: 'send_modal.channel_whatsapp',
        subtitleKey: 'send_modal.channel_whatsapp_sub',
        subtitleOffKey: 'send_modal.channel_whatsapp_off',
        integrationKey: 'whatsapp',
    },
    {
        id: 'postbode',
        icon: 'postbode',
        color: '#C2410C',
        titleKey: 'send_modal.channel_postbode',
        subtitleKey: 'send_modal.channel_postbode_sub',
        subtitleOffKey: 'send_modal.channel_postbode_off',
        integrationKey: 'postbode',
    },
];

function channelEnabled(channel, { postbodeConfigured, whatsappConfigured }) {
    if (channel.quoteDisabled) {
        return false;
    }
    if (channel.integrationKey === 'whatsapp') {
        return whatsappConfigured;
    }
    if (channel.integrationKey === 'postbode') {
        return postbodeConfigured;
    }
    return true;
}

export default function SendOfferModal({
    open,
    onClose,
    offerId,
    defaultEmail = '',
    customerName = '',
    legalDocumentIds = [],
    attachmentCount = 0,
    postbodeConfigured = false,
    whatsappConfigured = false,
    whatsappShareUrl = '',
    onBeforeSend,
}) {
    const [channelError, setChannelError] = useState('');
    const [activeChannel, setActiveChannel] = useState('email');
    const form = useForm({
        emails: parseDefaultEmails(defaultEmail),
        message: '',
        channels: ['email'],
        legal_document_ids: legalDocumentIds,
        registered: false,
    });

    const wasOpen = useRef(false);
    useEffect(() => {
        if (open && !wasOpen.current) {
            setChannelError('');
            setActiveChannel('email');
            form.setData({
                emails: parseDefaultEmails(defaultEmail),
                message: '',
                channels: ['email'],
                legal_document_ids: legalDocumentIds,
                registered: false,
            });
            form.clearErrors();
        }
        wasOpen.current = open;
    }, [open, defaultEmail, legalDocumentIds]);

    const selectChannel = (id, enabled) => {
        if (!enabled) {
            return;
        }
        setChannelError('');
        setActiveChannel(id);
        form.setData('channels', [id]);
    };

    const submit = () => {
        if (!offerId) return;
        const emails = parseDefaultEmails(defaultEmail);
        if (form.data.channels.length === 0) {
            setChannelError(t('offers.channel_required'));
            return;
        }
        if (form.data.channels.includes('email') && emails.length === 0) {
            setChannelError(t('offers.send_emails_required'));
            return;
        }

        form.setData('emails', emails);

        const openWhatsapp = form.data.channels.includes('whatsapp') && whatsappShareUrl;

        const runSend = () => {
            form.post(`/offers/${offerId}/send`, {
                preserveScroll: true,
                onSuccess: () => {
                    if (openWhatsapp) {
                        window.open(whatsappShareUrl, '_blank', 'noopener,noreferrer');
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

    if (!open) {
        return null;
    }

    const toEmail = defaultEmail || '—';
    const attachmentsLabel = t('offers.send_attachments_auto').replace(':count', String(attachmentCount));

    return (
        <>
            <button type="button" className="offacto-brief-scrim on" aria-label={t('common.close')} onClick={onClose} />
            <div
                className="offacto-brief-modal offacto-send-modal on"
                role="dialog"
                aria-modal="true"
                aria-labelledby="offacto-send-modal-title"
            >
                <div className="offacto-brief-edit-card-h">
                    <h3 id="offacto-send-modal-title">{t('offers.send_modal_title')}</h3>
                    <button type="button" className="offacto-brief-modal-close" onClick={onClose} aria-label={t('common.close')}>
                        <Icon name="close" />
                    </button>
                </div>
                <div className="offacto-brief-modal-b offacto-send-modal-b">
                    <p className="offacto-send-to-line">
                        {t('offers.send_to_line')}: <strong>{customerName || '—'}</strong>
                        {toEmail !== '—' ? <> · {toEmail}</> : null}
                    </p>

                    <div className="offacto-send-channels">
                        {OFFER_SEND_CHANNELS.map((channel) => {
                            const enabled = channelEnabled(channel, { postbodeConfigured, whatsappConfigured });
                            const subtitleKey =
                                enabled || !channel.subtitleOffKey ? channel.subtitleKey : channel.subtitleOffKey;
                            const isOn = activeChannel === channel.id;

                            return (
                                <button
                                    key={channel.id}
                                    type="button"
                                    disabled={!enabled}
                                    className={`offacto-send-chan${isOn ? ' is-on' : ''}${enabled ? '' : ' is-off'}`}
                                    onClick={() => selectChannel(channel.id, enabled)}
                                >
                                    <span className="offacto-send-chan__lg" style={{ background: channel.color }}>
                                        <SendChannelBadgeIcon icon={channel.icon} className="offacto-send-chan__icon" />
                                    </span>
                                    <span className="offacto-send-chan__body">
                                        <strong>{t(channel.titleKey)}</strong>
                                        <span className="offacto-send-chan__hint">{t(subtitleKey)}</span>
                                    </span>
                                    {isOn ? <Icon name="check" className="offacto-send-chan__check" /> : null}
                                </button>
                            );
                        })}
                    </div>
                    {channelError ? <p className="offacto-send-field-error">{channelError}</p> : null}

                    <div className="offacto-send-footer-row">
                        <span className="offacto-send-attach-hint">
                            <Icon name="clip" />
                            {attachmentsLabel}
                        </span>
                        <button
                            type="button"
                            disabled={form.processing}
                            className="offacto-brief-btn offacto-btn-p"
                            onClick={submit}
                        >
                            <Icon name="send" />
                            {t('offers.send_confirm')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
