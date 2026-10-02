import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Modal from './Modal';
import { t } from '../lib/i18n';

export default function SubscriptionReminderModal() {
    const { subscriptionReminder, billingRemindersEnabled, auth } = usePage().props;
    const [open, setOpen] = useState(Boolean(subscriptionReminder));

    if (!subscriptionReminder || auth?.user?.is_admin) {
        return null;
    }

    const remindersForm = useForm({
        enabled: subscriptionReminder.reminders_enabled ?? billingRemindersEnabled,
    });

    const close = () => {
        setOpen(false);
        router.post('/subscription/reminder/dismiss', {}, { preserveScroll: true });
    };

    const saveReminders = (enabled) => {
        remindersForm.setData('enabled', enabled);
        remindersForm.patch('/subscription/reminders', { preserveScroll: true });
    };

    const title =
        subscriptionReminder.type === 'trial'
            ? t('subscription.modal.trial_title')
            : subscriptionReminder.type === 'subscription_expired'
              ? t('subscription.modal.expired_title')
              : t('subscription.modal.plan_title');

    const bodyKey =
        subscriptionReminder.type === 'trial'
            ? 'subscription.modal.trial_body'
            : subscriptionReminder.type === 'subscription_expired'
              ? 'subscription.modal.expired_body'
              : 'subscription.modal.plan_body';

    return (
        <Modal
            open={open}
            title={title}
            onClose={close}
            footer={
                <>
                    <button
                        type="button"
                        onClick={close}
                        className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                        {t('subscription.modal.dismiss')}
                    </button>
                    <Link
                        href="/upgrade"
                        onClick={close}
                        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        {t('subscription.modal.view_plans')}
                    </Link>
                </>
            }
        >
            <p className="text-sm leading-relaxed text-slate-600">
                {t(bodyKey, { days: subscriptionReminder.days_left })}
            </p>
            {subscriptionReminder.cancel_at_period_end && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    {t('subscription.modal.cancel_scheduled')}
                </p>
            )}
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 px-3 py-3">
                <input
                    type="checkbox"
                    className="mt-1 rounded border-slate-300"
                    checked={remindersForm.data.enabled}
                    onChange={(e) => saveReminders(e.target.checked)}
                />
                <span className="text-sm text-slate-700">{t('subscription.modal.email_reminders')}</span>
            </label>
        </Modal>
    );
}
