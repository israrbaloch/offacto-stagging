import { useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { t } from '../lib/i18n';

export default function InvoiceReminderModal({ open, onClose, invoiceId, defaultEmail = '' }) {
    const form = useForm({
        email: defaultEmail,
        message: '',
    });
    const wasOpen = useRef(false);

    useEffect(() => {
        if (open && !wasOpen.current) {
            form.setData({ email: defaultEmail, message: '' });
            form.clearErrors();
        }
        wasOpen.current = open;
    }, [open, defaultEmail]);

    const submit = () => {
        if (!invoiceId) return;
        form.post(`/invoices/${invoiceId}/reminder`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t('invoices.reminder_modal_title')}
            size="md"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={submit} disabled={form.processing}>
                        {t('invoices.reminder_send')}
                    </Button>
                </>
            }
        >
            <p className="mb-4 text-sm text-slate-600">{t('invoices.reminder_modal_hint')}</p>
            <div className="space-y-4">
                <Input
                    label={t('offers.send_emails_label')}
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                />
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        {t('offers.send_message_label')}{' '}
                        <span className="font-normal text-slate-400">({t('send_modal.optional')})</span>
                    </label>
                    <textarea
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        rows={5}
                        value={form.data.message}
                        onChange={(e) => form.setData('message', e.target.value)}
                        placeholder={t('invoices.reminder_message_placeholder')}
                    />
                    {form.errors.message && <p className="mt-1 text-sm text-rose-600">{form.errors.message}</p>}
                </div>
            </div>
        </Modal>
    );
}
