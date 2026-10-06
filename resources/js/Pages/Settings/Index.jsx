import { router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Icon from '../../Components/Icon';
import PlanEntitlementBuilder from '../../Components/PlanEntitlementBuilder';
import SelectMenu from '../../Components/SelectMenu';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { t } from '../../lib/i18n';

const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

const textareaClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 min-h-[72px] resize-y';

const NAV = [
    { id: 'general', icon: 'building', labelKey: 'settings.nav_general' },
    { id: 'platform', icon: 'grid', labelKey: 'settings.nav_platform' },
    { id: 'billing', icon: 'invoice', labelKey: 'settings.nav_billing' },
    { id: 'plans', icon: 'document', labelKey: 'settings.nav_plans' },
];

function Panel({ title, description, children, footer }) {
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5 sm:px-8">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
                {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>}
            </div>
            <div className="px-6 py-6 sm:px-8">{children}</div>
            {footer && <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-8">{footer}</div>}
        </div>
    );
}

function SaveButton({ processing, label }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
            {label}
            <span aria-hidden="true">→</span>
        </button>
    );
}

function Toggle({ checked, onChange, label, hint }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 px-4 py-3.5">
            <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
                <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-5' : 'left-0.5'}`}
                />
            </button>
        </div>
    );
}

function LocaleLabels({ locales, labels, onChange, multiline = false }) {
    const Input = multiline ? 'textarea' : 'input';
    const className = multiline ? textareaClass : fieldClass;

    return (
        <div className="grid gap-3 lg:grid-cols-3">
            {locales.map((locale) => (
                <label key={locale} className="block text-sm">
                    <span className="mb-1.5 flex items-center gap-2 font-medium uppercase tracking-wide text-slate-500">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px]">{locale}</span>
                    </span>
                    <Input
                        className={className}
                        value={labels[locale] ?? ''}
                        onChange={(e) => onChange(locale, e.target.value)}
                    />
                </label>
            ))}
        </div>
    );
}

export default function SettingsIndex({
    locales = ['en', 'fr', 'nl'],
    overview = {},
    general = {},
    platform = {},
    payment = {},
    plans = [],
    planEntitlementCatalog = {},
    currencyOptions = ['EUR', 'USD', 'GBP'],
}) {
    const [section, setSection] = useState('general');
    const [showNewPlan, setShowNewPlan] = useState(false);

    const generalForm = useForm({ ...general });
    const platformForm = useForm({ ...platform });
    const paymentForm = useForm({
        payment_gateway: payment.gateway || 'mollie',
        payment_mollie_mode: payment.mollie_mode || 'test',
        payment_mollie_test_key: '',
        payment_mollie_live_key: '',
    });
    const plansForm = useForm({ plans });
    const defaultEntitlements = planEntitlementCatalog?.defaults ?? { capabilities: {}, limits: {} };
    const emptyLabels = useMemo(() => Object.fromEntries(locales.map((l) => [l, ''])), [locales]);
    const newPlanForm = useForm({
        slug: '',
        price_cents: 0,
        currency: overview.default_currency || 'EUR',
        is_active: true,
        is_highlighted: false,
        sort_order: (plans?.length ?? 0) + 1,
        name_labels: { ...emptyLabels },
        description_labels: { ...emptyLabels },
        entitlements: defaultEntitlements,
    });

    const currencyLabels = useMemo(
        () => currencyOptions.map((c) => ({ value: c, label: c })),
        [currencyOptions],
    );

    const updatePlan = (index, field, value) => {
        const next = [...plansForm.data.plans];
        next[index] = { ...next[index], [field]: value };
        plansForm.setData('plans', next);
    };

    const updatePlanEntitlements = (index, entitlements) => {
        updatePlan(index, 'entitlements', entitlements);
    };

    const updatePlanFeature = (planIndex, featureIndex, field, value) => {
        const next = [...plansForm.data.plans];
        const features = [...next[planIndex].feature_items];
        features[featureIndex] = { ...features[featureIndex], [field]: value };
        next[planIndex] = { ...next[planIndex], feature_items: features };
        plansForm.setData('plans', next);
    };

    const updateFeatureLabel = (planIndex, featureIndex, locale, value) => {
        const next = [...plansForm.data.plans];
        const features = [...next[planIndex].feature_items];
        const label = { ...features[featureIndex].label, [locale]: value };
        features[featureIndex] = { ...features[featureIndex], label };
        next[planIndex] = { ...next[planIndex], feature_items: features };
        plansForm.setData('plans', next);
    };

    const addFeature = (planIndex) => {
        const next = [...plansForm.data.plans];
        const empty = Object.fromEntries(locales.map((l) => [l, '']));
        next[planIndex].feature_items = [
            ...next[planIndex].feature_items,
            { included: true, label: empty },
        ];
        plansForm.setData('plans', next);
    };

    const removeFeature = (planIndex, featureIndex) => {
        const next = [...plansForm.data.plans];
        next[planIndex].feature_items = next[planIndex].feature_items.filter((_, i) => i !== featureIndex);
        plansForm.setData('plans', next);
    };

    return (
        <AuthenticatedLayout title={t('settings.admin_title')}>
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex flex-col gap-6 border-b border-slate-200/80 pb-8 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                            {t('settings.eyebrow')}
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{t('settings.admin_title')}</h1>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">{t('settings.subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-400">{t('settings.stat_currency')}</p>
                            <p className="mt-0.5 font-semibold text-slate-900">{overview.default_currency}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-400">{t('settings.stat_plans')}</p>
                            <p className="mt-0.5 font-semibold text-slate-900">{overview.active_plans}</p>
                        </div>
                        <div
                            className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                                overview.payment_configured
                                    ? 'border-emerald-200 bg-emerald-50/80'
                                    : 'border-amber-200 bg-amber-50/80'
                            }`}
                        >
                            <p className="text-xs uppercase tracking-wide text-slate-500">{t('settings.stat_billing')}</p>
                            <p className="mt-0.5 font-semibold text-slate-900">
                                {overview.payment_configured ? t('settings.billing_ready') : t('settings.billing_pending')}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <nav className="lg:w-56 lg:shrink-0">
                        <div className="sticky top-6 space-y-1 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
                            {NAV.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSection(item.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                                        section === item.id
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon name={item.icon} className="h-4 w-4 shrink-0 opacity-80" />
                                    {t(item.labelKey)}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div className="min-w-0 flex-1 space-y-8">
                        {section === 'general' && (
                            <Panel
                                title={t('settings.general_title')}
                                description={t('settings.general_desc')}
                            >
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        generalForm.patch('/settings/general', { preserveScroll: true });
                                    }}
                                    className="space-y-5"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="block text-sm">
                                            <span className="mb-1.5 block font-medium text-slate-700">{t('settings.site_name')}</span>
                                            <input
                                                className={fieldClass}
                                                value={generalForm.data.site_name}
                                                onChange={(e) => generalForm.setData('site_name', e.target.value)}
                                            />
                                        </label>
                                        <label className="block text-sm">
                                            <span className="mb-1.5 block font-medium text-slate-700">{t('settings.admin_email')}</span>
                                            <input
                                                type="email"
                                                className={fieldClass}
                                                value={generalForm.data.admin_email}
                                                onChange={(e) => generalForm.setData('admin_email', e.target.value)}
                                            />
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <Toggle
                                            label={t('settings.allow_registration')}
                                            checked={generalForm.data.allow_user_registration}
                                            onChange={(v) => generalForm.setData('allow_user_registration', v)}
                                        />
                                        <Toggle
                                            label={t('settings.send_welcome')}
                                            checked={generalForm.data.send_welcome_email}
                                            onChange={(v) => generalForm.setData('send_welcome_email', v)}
                                        />
                                        <Toggle
                                            label={t('settings.require_company_approval')}
                                            hint={t('settings.require_company_approval_hint')}
                                            checked={generalForm.data.require_company_approval}
                                            onChange={(v) => generalForm.setData('require_company_approval', v)}
                                        />
                                        <Toggle
                                            label={t('settings.require_service_approval')}
                                            checked={generalForm.data.require_service_approval}
                                            onChange={(v) => generalForm.setData('require_service_approval', v)}
                                        />
                                    </div>
                                    <div className="flex justify-end border-t border-slate-100 pt-4">
                                        <SaveButton processing={generalForm.processing} label={t('settings.save_general')} />
                                    </div>
                                </form>
                            </Panel>
                        )}

                        {section === 'platform' && (
                            <Panel title={t('settings.platform_title')} description={t('settings.platform_desc')}>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        platformForm.patch('/settings/platform', { preserveScroll: true });
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block text-sm">
                                        <span className="mb-1.5 block font-medium text-slate-700">{t('settings.default_currency')}</span>
                                        <SelectMenu
                                            value={platformForm.data.platform_default_currency}
                                            onChange={(e) => platformForm.setData('platform_default_currency', e.target.value)}
                                            className={fieldClass}
                                            options={currencyLabels}
                                        />
                                    </label>
                                    <label className="block text-sm">
                                        <span className="mb-1.5 block font-medium text-slate-700">{t('settings.default_vat')}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className={fieldClass}
                                            value={platformForm.data.default_vat_rate}
                                            onChange={(e) => platformForm.setData('default_vat_rate', Number(e.target.value))}
                                        />
                                    </label>
                                    <label className="block text-sm">
                                        <span className="mb-1.5 block font-medium text-slate-700">{t('settings.invoice_prefix')}</span>
                                        <input
                                            className={fieldClass}
                                            value={platformForm.data.invoice_prefix}
                                            onChange={(e) => platformForm.setData('invoice_prefix', e.target.value)}
                                        />
                                    </label>
                                    <label className="block text-sm">
                                        <span className="mb-1.5 block font-medium text-slate-700">{t('settings.offer_prefix')}</span>
                                        <input
                                            className={fieldClass}
                                            value={platformForm.data.offer_prefix}
                                            onChange={(e) => platformForm.setData('offer_prefix', e.target.value)}
                                        />
                                    </label>
                                    </div>
                                    <div className="flex justify-end border-t border-slate-100 pt-4">
                                        <SaveButton processing={platformForm.processing} label={t('settings.save_platform')} />
                                    </div>
                                </form>
                            </Panel>
                        )}

                        {section === 'billing' && (
                            <Panel title={t('settings.payment_title')} description={t('settings.payment_hint')}>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        paymentForm.patch('/settings/payment-gateway', { preserveScroll: true });
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="block text-sm">
                                            <span className="mb-1.5 block font-medium text-slate-700">{t('settings.gateway')}</span>
                                            <SelectMenu
                                                value={paymentForm.data.payment_gateway}
                                                onChange={(e) => paymentForm.setData('payment_gateway', e.target.value)}
                                                className={fieldClass}
                                                options={[
                                                    { value: 'mollie', label: 'Mollie' },
                                                    { value: 'none', label: t('settings.gateway_none') },
                                                ]}
                                            />
                                        </label>
                                        <label className="block text-sm">
                                            <span className="mb-1.5 block font-medium text-slate-700">{t('settings.mollie_mode')}</span>
                                            <SelectMenu
                                                value={paymentForm.data.payment_mollie_mode}
                                                onChange={(e) => paymentForm.setData('payment_mollie_mode', e.target.value)}
                                                className={fieldClass}
                                                options={[
                                                    { value: 'test', label: t('settings.mode_test') },
                                                    { value: 'live', label: t('settings.mode_live') },
                                                ]}
                                            />
                                        </label>
                                    </div>
                                    <label className="block text-sm">
                                        <span className="mb-1.5 block font-medium text-slate-700">{t('settings.mollie_test_key')}</span>
                                        <input
                                            type="password"
                                            autoComplete="off"
                                            placeholder={
                                                payment.mollie_test_key_set
                                                    ? t('settings.key_placeholder_set')
                                                    : t('settings.key_placeholder')
                                            }
                                            className={fieldClass}
                                            value={paymentForm.data.payment_mollie_test_key}
                                            onChange={(e) => paymentForm.setData('payment_mollie_test_key', e.target.value)}
                                        />
                                    </label>
                                    <label className="block text-sm">
                                        <span className="mb-1.5 block font-medium text-slate-700">{t('settings.mollie_live_key')}</span>
                                        <input
                                            type="password"
                                            autoComplete="off"
                                            placeholder={
                                                payment.mollie_live_key_set
                                                    ? t('settings.key_placeholder_set')
                                                    : t('settings.key_placeholder')
                                            }
                                            className={fieldClass}
                                            value={paymentForm.data.payment_mollie_live_key}
                                            onChange={(e) => paymentForm.setData('payment_mollie_live_key', e.target.value)}
                                        />
                                    </label>
                                    <p className="text-xs text-slate-500">
                                        {payment.mollie_configured ? t('settings.mollie_ready') : t('settings.mollie_missing')}
                                    </p>
                                    <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                                        {t('settings.company_integrations_note')}
                                    </p>
                                    <div className="flex justify-end border-t border-slate-100 pt-4">
                                        <SaveButton processing={paymentForm.processing} label={t('settings.save_payment')} />
                                    </div>
                                </form>
                            </Panel>
                        )}

                        {section === 'plans' && (
                            <Panel title={t('settings.plans_title')} description={t('settings.plans_desc')}>
                                <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPlan((v) => !v)}
                                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                                    >
                                        + {t('settings.add_plan')}
                                    </button>
                                </div>

                                {showNewPlan && (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            newPlanForm.post('/settings/plans', {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    setShowNewPlan(false);
                                                    newPlanForm.reset();
                                                },
                                            });
                                        }}
                                        className="mb-8 space-y-5 rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5 sm:p-6"
                                    >
                                        <p className="text-sm font-semibold text-slate-900">{t('settings.add_plan')}</p>
                                        <label className="block max-w-md text-sm">
                                            <span className="mb-1.5 block font-medium text-slate-700">{t('settings.new_plan_slug')}</span>
                                            <input
                                                className={fieldClass}
                                                value={newPlanForm.data.slug}
                                                onChange={(e) => newPlanForm.setData('slug', e.target.value.toLowerCase())}
                                                placeholder="pro"
                                            />
                                            <span className="mt-1 block text-xs text-slate-500">{t('settings.new_plan_slug_hint')}</span>
                                        </label>
                                        <LocaleLabels
                                            locales={locales}
                                            labels={newPlanForm.data.name_labels}
                                            onChange={(locale, value) =>
                                                newPlanForm.setData('name_labels', { ...newPlanForm.data.name_labels, [locale]: value })
                                            }
                                        />
                                        <PlanEntitlementBuilder
                                            catalog={planEntitlementCatalog}
                                            entitlements={newPlanForm.data.entitlements}
                                            onChange={(entitlements) => newPlanForm.setData('entitlements', entitlements)}
                                        />
                                        <SaveButton processing={newPlanForm.processing} label={t('settings.add_plan')} />
                                    </form>
                                )}

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        plansForm.patch('/settings/plans', { preserveScroll: true });
                                    }}
                                    className="space-y-8"
                                >
                                    {plansForm.data.plans.map((plan, planIndex) => (
                                        <div key={plan.id} className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5 sm:p-6">
                                            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                                        {plan.slug}
                                                    </p>
                                                    <p className="text-lg font-semibold text-slate-900">
                                                        {plan.name_labels?.en || plan.slug}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Toggle
                                                        label={t('settings.plan_active')}
                                                        checked={plan.is_active}
                                                        onChange={(v) => updatePlan(planIndex, 'is_active', v)}
                                                    />
                                                </div>
                                            </div>

                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {t('settings.plan_name')}
                                            </p>
                                            <LocaleLabels
                                                locales={locales}
                                                labels={plan.name_labels}
                                                onChange={(locale, value) => {
                                                    updatePlan(planIndex, 'name_labels', {
                                                        ...plan.name_labels,
                                                        [locale]: value,
                                                    });
                                                }}
                                            />

                                            <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {t('settings.plan_description')}
                                            </p>
                                            <LocaleLabels
                                                locales={locales}
                                                labels={plan.description_labels}
                                                multiline
                                                onChange={(locale, value) => {
                                                    updatePlan(planIndex, 'description_labels', {
                                                        ...plan.description_labels,
                                                        [locale]: value,
                                                    });
                                                }}
                                            />

                                            <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                                <label className="block text-sm">
                                                    <span className="mb-1.5 block font-medium text-slate-700">{t('settings.price_cents')}</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className={fieldClass}
                                                        value={plan.price_cents}
                                                        onChange={(e) => updatePlan(planIndex, 'price_cents', Number(e.target.value))}
                                                    />
                                                </label>
                                                <label className="block text-sm">
                                                    <span className="mb-1.5 block font-medium text-slate-700">{t('settings.plan_currency')}</span>
                                                    <SelectMenu
                                                        value={plan.currency}
                                                        onChange={(e) => updatePlan(planIndex, 'currency', e.target.value)}
                                                        className={fieldClass}
                                                        options={currencyLabels}
                                                    />
                                                </label>
                                                <label className="block text-sm">
                                                    <span className="mb-1.5 block font-medium text-slate-700">{t('settings.sort_order')}</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className={fieldClass}
                                                        value={plan.sort_order}
                                                        onChange={(e) => updatePlan(planIndex, 'sort_order', Number(e.target.value))}
                                                    />
                                                </label>
                                            </div>

                                            <div className="mt-4">
                                                <Toggle
                                                    label={t('settings.plan_highlight')}
                                                    checked={plan.is_highlighted}
                                                    onChange={(v) => updatePlan(planIndex, 'is_highlighted', v)}
                                                />
                                            </div>

                                            <div className="mt-8">
                                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    {t('settings.plan_entitlements')}
                                                </p>
                                                <PlanEntitlementBuilder
                                                    catalog={planEntitlementCatalog}
                                                    entitlements={plan.entitlements ?? defaultEntitlements}
                                                    onChange={(entitlements) => updatePlanEntitlements(planIndex, entitlements)}
                                                />
                                            </div>

                                            <div className="mt-8">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        {t('settings.plan_marketing_features')}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => addFeature(planIndex)}
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        + {t('settings.add_feature')}
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    {plan.feature_items.map((feature, featureIndex) => (
                                                        <div
                                                            key={`${plan.id}-f-${featureIndex}`}
                                                            className="rounded-xl border border-slate-200 bg-white p-4"
                                                        >
                                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                                <Toggle
                                                                    label={t('settings.feature_included')}
                                                                    checked={feature.included}
                                                                    onChange={(v) =>
                                                                        updatePlanFeature(planIndex, featureIndex, 'included', v)
                                                                    }
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFeature(planIndex, featureIndex)}
                                                                    className="text-xs font-medium text-rose-600 hover:text-rose-700"
                                                                >
                                                                    {t('settings.remove_feature')}
                                                                </button>
                                                            </div>
                                                            <LocaleLabels
                                                                locales={locales}
                                                                labels={feature.label}
                                                                onChange={(locale, value) =>
                                                                    updateFeatureLabel(planIndex, featureIndex, locale, value)
                                                                }
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-6 flex justify-end">
                                                <button
                                                    type="button"
                                                    className="text-sm font-medium text-rose-600 hover:text-rose-700"
                                                    onClick={() => {
                                                        if (window.confirm(t('settings.delete_plan') + '?')) {
                                                            router.delete(`/settings/plans/${plan.id}`, { preserveScroll: true });
                                                        }
                                                    }}
                                                >
                                                    {t('settings.delete_plan')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end">
                                        <SaveButton processing={plansForm.processing} label={t('settings.save_plans')} />
                                    </div>
                                </form>
                            </Panel>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
