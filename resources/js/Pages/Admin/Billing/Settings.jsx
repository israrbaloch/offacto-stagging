import { useForm } from '@inertiajs/react';
import {
    AdminBody,
    AdminButton,
    AdminCard,
    AdminCheckboxField,
    AdminField,
    AdminFormActions,
    AdminFormGrid,
    AdminHeader,
    AdminPage,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

function humanizeKey(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BillingSettings({ settings = {} }) {
    const form = useForm({
        trial_duration_days: settings.trial_duration_days ?? 14,
        subscription_reminder_days: settings.subscription_reminder_days ?? 7,
        dunning_grace_days: settings.dunning_grace_days ?? 7,
        dunning_max_retries: settings.dunning_max_retries ?? 3,
        platform_default_currency: settings.platform_default_currency ?? 'EUR',
        notifications: settings.notifications ?? {},
    });

    const submit = (e) => {
        e.preventDefault();
        form.patch('/admin/billing/settings');
    };

    const toggle = (key) => {
        form.setData('notifications', {
            ...form.data.notifications,
            [key]: !form.data.notifications[key],
        });
    };

    return (
        <AdminLayout title="Billing settings">
            <AdminPage>
                <AdminHeader eyebrow="Billing" title="Billing rules & notifications" description="Trials, dunning, currency defaults, and customer emails." />
                <AdminBody>
                    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
                        <AdminCard title="Trial configuration" description="Default length for new company trials. Entitlements follow the trial preset in the plan catalog.">
                            <AdminField label="Trial duration (days)">
                                <input type="number" min={1} className={inputClass} value={form.data.trial_duration_days} onChange={(e) => form.setData('trial_duration_days', Number(e.target.value))} />
                            </AdminField>
                        </AdminCard>

                        <AdminCard title="Dunning & reminders" description="Grace periods and retry limits after failed subscription payments.">
                            <AdminFormGrid cols={2}>
                                <AdminField label="Reminder window (days before expiry)">
                                    <input type="number" className={inputClass} value={form.data.subscription_reminder_days} onChange={(e) => form.setData('subscription_reminder_days', Number(e.target.value))} />
                                </AdminField>
                                <AdminField label="Grace period after failed payment (days)">
                                    <input type="number" className={inputClass} value={form.data.dunning_grace_days} onChange={(e) => form.setData('dunning_grace_days', Number(e.target.value))} />
                                </AdminField>
                                <AdminField label="Max payment retries" className="sm:col-span-2">
                                    <input type="number" className={inputClass} value={form.data.dunning_max_retries} onChange={(e) => form.setData('dunning_max_retries', Number(e.target.value))} />
                                </AdminField>
                            </AdminFormGrid>
                        </AdminCard>

                        <AdminCard title="Pricing defaults">
                            <AdminField label="Default currency">
                                <select className={selectClass} value={form.data.platform_default_currency} onChange={(e) => form.setData('platform_default_currency', e.target.value)}>
                                    {['EUR', 'USD', 'GBP'].map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </AdminField>
                        </AdminCard>

                        <AdminCard title="Billing notifications" description="Toggle automated emails for subscription lifecycle events.">
                            <div className="space-y-2">
                                {Object.entries(form.data.notifications).map(([key, enabled]) => (
                                    <AdminCheckboxField key={key} label={humanizeKey(key)} checked={!!enabled} onChange={() => toggle(key)} />
                                ))}
                            </div>
                        </AdminCard>

                        <AdminFormActions className="border-0 pt-0">
                            <AdminButton type="submit" disabled={form.processing}>
                                Save settings
                            </AdminButton>
                        </AdminFormActions>
                    </form>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
