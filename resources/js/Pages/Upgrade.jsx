import { Link, useForm, usePage } from '@inertiajs/react';
import Icon from '../Components/Icon';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import PageNotice from '../Components/PageNotice';
import { useUi } from '../context/UiContext';
import { t } from '../lib/i18n';

function PlanCard({ plan, onSelect, processing, checkoutDisabled }) {
    const selected = plan.is_current;
    const downgradeLocked = !plan.can_select && !selected;
    const highlighted = plan.highlight;

    return (
        <div
            className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                highlighted ? 'border-indigo-300 bg-indigo-50/40 ring-2 ring-indigo-200' : 'border-slate-200 bg-white'
            }`}
        >
            {highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                    {t('upgrade.popular')}
                </span>
            )}
            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-500">/{t(`upgrade.${plan.period}`)}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
            <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                disabled={processing || selected || checkoutDisabled || downgradeLocked}
                onClick={() => onSelect(plan.id)}
                className={`mt-6 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-default ${
                    selected
                        ? 'bg-emerald-100 text-emerald-800'
                        : downgradeLocked
                          ? 'bg-slate-100 text-slate-400'
                          : highlighted
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
            >
                {selected
                    ? t('upgrade.current_plan')
                    : downgradeLocked
                      ? t('upgrade.downgrade_not_available')
                      : t('upgrade.choose_plan')}
            </button>
        </div>
    );
}

function BillingManagement() {
    const { activeCompany, billingRemindersEnabled, auth } = usePage().props;
    const { confirm } = useUi();
    const cancelForm = useForm({});
    const remindersForm = useForm({ enabled: billingRemindersEnabled ?? true });

    if (auth?.user?.is_admin || !activeCompany?.subscription_valid) {
        return null;
    }

    const endsLabel = activeCompany.subscription_ends_at
        ? new Date(activeCompany.subscription_ends_at).toLocaleDateString()
        : null;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{t('subscription.billing_title')}</h2>
            <p className="mt-1 text-sm text-slate-600">
                {activeCompany.subscription_cancel_at_period_end
                    ? t('subscription.cancel_pending', { date: endsLabel })
                    : t('subscription.renews_on', { date: endsLabel })}
            </p>
            <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={remindersForm.data.enabled}
                    onChange={(e) => {
                        remindersForm.setData('enabled', e.target.checked);
                        remindersForm.patch('/subscription/reminders', { preserveScroll: true });
                    }}
                />
                {t('subscription.email_reminders_label')}
            </label>
            {!activeCompany.subscription_cancel_at_period_end && (
                <button
                    type="button"
                    disabled={cancelForm.processing}
                    onClick={async () => {
                        if (
                            await confirm({
                                message: t('subscription.cancel_confirm'),
                                confirmLabel: t('subscription.cancel_plan'),
                                danger: true,
                            })
                        ) {
                            cancelForm.post('/subscription/cancel', { preserveScroll: true });
                        }
                    }}
                    className="mt-4 text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                >
                    {t('subscription.cancel_plan')}
                </button>
            )}
        </div>
    );
}

export default function Upgrade({ plans = [], trialExpired = false, paymentConfigured = true }) {
    const { activeCompany, flash } = usePage().props;
    const form = useForm({ plan: '' });

    const selectPlan = (planId) => {
        form.setData('plan', planId);
        form.post('/upgrade', { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout title={t('upgrade.title')}>
            <div className="mx-auto max-w-5xl space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900">{t('upgrade.title')}</h1>
                    <p className="mt-2 text-slate-600">
                        {trialExpired ? t('upgrade.trial_expired_body') : t('upgrade.body')}
                    </p>
                    {activeCompany?.subscription_plan && (
                        <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800">
                            {t('upgrade.active_plan', {
                                plan: t(`upgrade.plans.${activeCompany.subscription_plan}.name`),
                            })}
                        </p>
                    )}
                    {flash?.status === 'payment-processing' && (
                        <PageNotice variant="info" className="mt-3 text-left">
                            {t('upgrade.payment_processing')}
                        </PageNotice>
                    )}
                    {!paymentConfigured && (
                        <PageNotice variant="warning" className="mt-3 text-left">
                            {t('upgrade.payment_not_configured')}
                        </PageNotice>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            processing={form.processing}
                            onSelect={selectPlan}
                            checkoutDisabled={!paymentConfigured}
                        />
                    ))}
                </div>

                <BillingManagement />

                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-600">
                    <p>{t('upgrade.billing_note')}</p>
                    <Link href="/support" className="mt-2 inline-block font-medium text-indigo-600 hover:text-indigo-700">
                        {t('upgrade.need_help')} →
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
