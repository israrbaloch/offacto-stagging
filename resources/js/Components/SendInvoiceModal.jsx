import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import EmailRecipientsField from './EmailRecipientsField';
import { Select } from './Input';
import {
    ChannelCard,
    DeliveryChannelsPanel,
    EmailDeliveryPanel,
    MessageField,
    SendInfoBanner,
    SendModalFooter,
    SendModalFrame,
} from './SendModalUi';
import { t } from '../lib/i18n';

const REMINDER_OFFSETS = [
    { value: '7', labelKey: 'invoices.reminder_7_before' },
    { value: '3', labelKey: 'invoices.reminder_3_before' },
    { value: '0', labelKey: 'invoices.reminder_on_due' },
    { value: '-3', labelKey: 'invoices.reminder_3_after' },
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

function buildInvoiceChannels({ postbodeConfigured, peppolConfigured, mollieConfigured }) {
    const channels = [
        {
            id: 'email',
            titleKey: 'send_modal.channel_email',
            subtitleKey: 'send_modal.channel_email_invoice_sub',
            icon: 'email',
        },
        {
            id: 'whatsapp',
            titleKey: 'send_modal.channel_whatsapp',
            subtitleKey: 'send_modal.channel_whatsapp_sub',
            icon: 'whatsapp',
        },
        {
            id: 'peppol',
            titleKey: 'send_modal.channel_peppol',
            subtitleKey: peppolConfigured ? 'send_modal.channel_peppol_sub' : 'send_modal.channel_peppol_off',
            badgeKey: 'send_modal.badge_peppol',
            icon: 'peppol',
            alwaysShow: true,
            disabled: !peppolConfigured,
        },
    ];

    if (postbodeConfigured) {
        channels.push({
            id: 'postbode',
            titleKey: 'send_modal.channel_postbode',
            subtitleKey: 'send_modal.channel_postbode_sub',
            badgeKey: 'send_modal.badge_postal',
            icon: 'postbode',
        });
    }

    if (mollieConfigured) {
        channels.push({
            id: 'mollie',
            titleKey: 'send_modal.channel_mollie',
            subtitleKey: 'send_modal.channel_mollie_sub',
            icon: 'mollie',
        });
    }

    return channels;
}

export default function SendInvoiceModal({
    open,
    onClose,
    invoiceId,
    documentNumber = '',
    defaultEmail = '',
    defaultMessage = '',
    legalDocumentIds = [],
    postbodeConfigured = false,
    peppolConfigured = false,
    mollieConfigured = false,
    whatsappShareUrl = '',
    dueDate = '',
    canScheduleReminder = true,
    onBeforeSend,
}) {
    const [channelError, setChannelError] = useState('');
    const form = useForm({
        emails: parseDefaultEmails(defaultEmail),
        message: defaultMessage,
        channels: ['email'],
        legal_document_ids: legalDocumentIds,
        registered: false,
        attach_ubl: false,
        cc_company: false,
        reminder_enabled: false,
        reminder_days_before_due: '3',
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
                attach_ubl: false,
                cc_company: false,
                reminder_enabled: Boolean(dueDate) && canScheduleReminder,
                reminder_days_before_due: '3',
            });
            form.clearErrors();
        }
        wasOpen.current = open;
    }, [open, defaultEmail, defaultMessage, legalDocumentIds, dueDate, canScheduleReminder]);

    const channelDefs = buildInvoiceChannels({ postbodeConfigured, peppolConfigured, mollieConfigured });

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
        if (!invoiceId) return;
        if (form.data.channels.length === 0) {
            setChannelError(t('offers.channel_required'));
            return;
        }
        if (form.data.channels.includes('email') && form.data.emails.length === 0) {
            form.setError('emails', t('offers.send_emails_required'));
            return;
        }

        const payload = {
            ...form.data,
            reminder_days_before_due: form.data.reminder_enabled
                ? Number(form.data.reminder_days_before_due)
                : null,
        };

        const openWhatsapp = payload.channels.includes('whatsapp') && whatsappShareUrl;

        const runSend = () => {
            form.transform(() => payload);
            form.post(`/invoices/${invoiceId}/send`, {
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

    const showEmail = form.data.channels.includes('email');
    const showPostbode = form.data.channels.includes('postbode');

    return (
        <SendModalFrame
            open={open}
            onClose={onClose}
            title={t('invoices.send_modal_title')}
            documentNumber={documentNumber}
            hint={t('invoices.send_modal_hint')}
            footer={
                <SendModalFooter
                    onCancel={onClose}
                    onSubmit={submit}
                    processing={form.processing}
                />
            }
        >
            <div className="grid gap-6 lg:grid-cols-2">
                <DeliveryChannelsPanel
                    channelError={channelError}
                    extra={
                        <>
                            {showPostbode && (
                                <div className="mt-4 border-t border-slate-200 pt-4">
                                    <label className="flex items-start gap-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={form.data.registered}
                                            onChange={(e) => form.setData('registered', e.target.checked)}
                                            className="mt-0.5"
                                        />
                                        <span>{t('integrations.postbode_registered_shipment')}</span>
                                    </label>
                                </div>
                            )}
                            {dueDate && canScheduleReminder && (
                                <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        {t('invoices.reminder_section')}
                                    </h4>
                                    <label className="flex items-start gap-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5"
                                            checked={form.data.reminder_enabled}
                                            onChange={(e) => form.setData('reminder_enabled', e.target.checked)}
                                        />
                                        <span>{t('invoices.reminder_schedule')}</span>
                                    </label>
                                    {form.data.reminder_enabled && (
                                        <Select
                                            label={t('invoices.reminder_when')}
                                            value={String(form.data.reminder_days_before_due)}
                                            onChange={(e) => form.setData('reminder_days_before_due', e.target.value)}
                                            options={REMINDER_OFFSETS.map((opt) => ({
                                                value: opt.value,
                                                label: t(opt.labelKey),
                                            }))}
                                            error={form.errors.reminder_days_before_due}
                                        />
                                    )}
                                    <p className="text-xs text-slate-500">{t('invoices.reminder_schedule_hint')}</p>
                                </div>
                            )}
                        </>
                    }
                >
                    {channelDefs.map((channel) => (
                        <ChannelCard
                            key={channel.id}
                            id={channel.id}
                            icon={channel.icon}
                            title={t(channel.titleKey)}
                            subtitle={t(channel.subtitleKey)}
                            badge={channel.badgeKey ? t(channel.badgeKey) : null}
                            checked={form.data.channels.includes(channel.id)}
                            disabled={Boolean(channel.disabled)}
                            onToggle={toggleChannel}
                        />
                    ))}
                </DeliveryChannelsPanel>

                <EmailDeliveryPanel show={showEmail} placeholderOff={t('offers.send_email_section_off')}>
                    <EmailRecipientsField
                        label={t('offers.send_emails_label')}
                        value={form.data.emails}
                        onChange={(emails) => form.setData('emails', emails)}
                        error={emailError}
                    />
                    <MessageField
                        label={t('offers.send_message_label')}
                        optionalLabel={t('send_modal.optional')}
                        placeholder={t('send_modal.message_placeholder')}
                        value={form.data.message}
                        onChange={(e) => form.setData('message', e.target.value)}
                    />
                    <SendInfoBanner>{t('invoices.email_message_hint')}</SendInfoBanner>
                    <div className="space-y-2.5 pt-1">
                        <label className="flex items-start gap-2.5 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                className="mt-0.5"
                                checked={form.data.attach_ubl}
                                onChange={(e) => form.setData('attach_ubl', e.target.checked)}
                            />
                            <span>{t('invoices.send_attach_ubl')}</span>
                        </label>
                        <label className="flex items-start gap-2.5 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                className="mt-0.5"
                                checked={form.data.cc_company}
                                onChange={(e) => form.setData('cc_company', e.target.checked)}
                            />
                            <span>{t('invoices.send_cc_company')}</span>
                        </label>
                    </div>
                </EmailDeliveryPanel>
            </div>
        </SendModalFrame>
    );
}
