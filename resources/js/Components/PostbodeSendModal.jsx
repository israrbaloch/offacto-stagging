import { useForm } from '@inertiajs/react';
import Button from './Button';
import Modal from './Modal';
import { t } from '../lib/i18n';

export default function PostbodeSendModal({ open, onClose, actionUrl, documentLabel }) {
    const form = useForm({ registered: false });

    return (
        <Modal open={open} onClose={onClose} title={t('integrations.postbode_send_title')}>
            <p className="text-sm text-slate-600">{t('integrations.postbode_send_body', { document: documentLabel })}</p>
            <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.data.registered}
                    onChange={(e) => form.setData('registered', e.target.checked)}
                />
                <span>{t('integrations.postbode_registered_shipment')}</span>
            </label>
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>
                    {t('common.cancel')}
                </Button>
                <Button
                    disabled={form.processing}
                    onClick={() =>
                        form.post(actionUrl, {
                            preserveScroll: true,
                            onSuccess: () => onClose(),
                        })
                    }
                >
                    {t('integrations.postbode_send_confirm')}
                </Button>
            </div>
        </Modal>
    );
}
