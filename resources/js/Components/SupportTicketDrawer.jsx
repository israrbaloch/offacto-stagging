import { useForm } from '@inertiajs/react';
import Icon from './Icon';
import SelectMenu from './SelectMenu';
import SupportTicketImagePicker from './SupportTicketImagePicker';
import { t } from '../lib/i18n';

const PRIORITY_OPTIONS = [
    { value: 'low', labelKey: 'support.priority_low' },
    { value: 'normal', labelKey: 'support.priority_normal' },
    { value: 'high', labelKey: 'support.priority_high' },
    { value: 'urgent', labelKey: 'support.priority_urgent' },
];

export default function SupportTicketDrawer({ open, onClose, companyName = '' }) {
    const form = useForm({
        subject: '',
        description: '',
        priority: 'normal',
        images: [],
    });

    const priorityOptions = PRIORITY_OPTIONS.map((row) => ({
        value: row.value,
        label: t(row.labelKey),
    }));

    const submit = (e) => {
        e.preventDefault();
        form.post('/support/tickets', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <>
            <button
                type="button"
                className={`offacto-drawer-scrim${open ? ' on' : ''}`}
                aria-label={t('common.close')}
                onClick={onClose}
            />
            <aside
                className={`offacto-drawer offacto-customer-drawer offacto-support-drawer${open ? ' on' : ''}`}
                aria-hidden={!open}
                aria-label={t('support.new_ticket')}
            >
                <div className="offacto-drawer-head">
                    <div className="offacto-drawer-who">
                        <span className="offacto-drawer-av">
                            <Icon name="help" />
                        </span>
                        <div>
                            <h3>{t('support.new_ticket')}</h3>
                            {companyName ? <small>{companyName}</small> : null}
                        </div>
                    </div>
                    <button type="button" className="offacto-drawer-icobtn" onClick={onClose} aria-label={t('common.close')}>
                        <Icon name="x" />
                    </button>
                </div>

                <form className="offacto-drawer-form" onSubmit={submit}>
                    <div className="offacto-drawer-body">
                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl">{t('support.subject')}</label>
                            <input
                                className="offacto-drawer-inp"
                                value={form.data.subject}
                                onChange={(e) => form.setData('subject', e.target.value)}
                                required
                            />
                        </div>
                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl">{t('support.message')}</label>
                            <textarea
                                className="offacto-drawer-inp offacto-support-drawer-textarea"
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                required
                            />
                        </div>
                        <div className="offacto-drawer-field">
                            <SupportTicketImagePicker
                                files={form.data.images}
                                onChange={(images) => form.setData('images', images)}
                            />
                        </div>
                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl">{t('support.priority')}</label>
                            <SelectMenu
                                variant="demo"
                                className="offacto-drawer-inp"
                                value={form.data.priority}
                                onChange={(e) => form.setData('priority', e.target.value)}
                                allowEmpty={false}
                                options={priorityOptions}
                            />
                        </div>
                    </div>
                    <div className="offacto-drawer-foot">
                        <div className="offacto-drawer-foot-spacer" />
                        <button type="button" className="offacto-drawer-btn" onClick={onClose} disabled={form.processing}>
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="offacto-drawer-btn primary" disabled={form.processing}>
                            {t('support.submit_ticket')}
                        </button>
                    </div>
                </form>
            </aside>
        </>
    );
}
