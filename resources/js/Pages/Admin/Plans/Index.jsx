import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PlanEntitlementBuilder from '../../../Components/PlanEntitlementBuilder';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminCard,
    AdminCheckboxField,
    AdminField,
    AdminFormActions,
    AdminFormGrid,
    AdminHeader,
    AdminLinkButton,
    AdminPage,
    AdminSection,
    AdminTextButton,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { money } from '../../../lib/utils';

function planTitle(plan) {
    return plan.name_labels?.en || plan.name_labels?.nl || plan.slug;
}

export default function AdminPlansIndex({ plans = [], planEntitlementCatalog = {}, locales = ['en'], currencies = ['EUR'], intervals = ['monthly'] }) {
    const form = useForm({ plans });
    const defaultEntitlements = planEntitlementCatalog?.defaults ?? { capabilities: {}, limits: {} };
    const [openId, setOpenId] = useState(plans[0]?.id ?? null);
    const [showCreate, setShowCreate] = useState(false);
    const emptyLabels = Object.fromEntries(locales.map((l) => [l, '']));
    const createForm = useForm({
        slug: '',
        price: 0,
        currency: currencies[0] || 'EUR',
        billing_interval: intervals[0] || 'monthly',
        is_active: true,
        is_highlighted: false,
        sort_order: plans.length,
        name_labels: { ...emptyLabels },
        description_labels: { ...emptyLabels },
        entitlements: defaultEntitlements,
    });

    const updatePlan = (index, patch) => {
        const next = [...form.data.plans];
        next[index] = { ...next[index], ...patch };
        form.setData('plans', next);
    };

    const updateEntitlements = (index, entitlements) => updatePlan(index, { entitlements });

    const submit = (event) => {
        event.preventDefault();
        form.patch('/admin/plans', { preserveScroll: true });
    };

    return (
        <AdminLayout title="Plans">
            <AdminPage>
                <AdminHeader
                    eyebrow="Billing"
                    title="Plans & entitlements"
                    description="Commercial terms, module access, and usage limits for each subscription tier."
                    actions={
                        <>
                            <AdminButton variant="secondary" onClick={() => setShowCreate((v) => !v)}>
                                {showCreate ? 'Close' : 'New plan'}
                            </AdminButton>
                            <AdminLinkButton href="/admin/subscriptions" variant="secondary">
                                Subscriptions
                            </AdminLinkButton>
                        </>
                    }
                />
                <AdminBody className="space-y-6">
                    {showCreate && (
                        <AdminCard title="New plan" description="Slug must be lowercase with hyphens. Enter price in your billing currency (e.g. 29.00).">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    createForm.post('/admin/plans', { onSuccess: () => createForm.reset() });
                                }}
                            >
                                <AdminFormGrid cols={2}>
                                    <AdminField label="Slug">
                                        <input className={inputClass} placeholder="starter" value={createForm.data.slug} onChange={(e) => createForm.setData('slug', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Display name (EN)">
                                        <input
                                            className={inputClass}
                                            value={createForm.data.name_labels.en || ''}
                                            onChange={(e) => createForm.setData('name_labels', { ...createForm.data.name_labels, en: e.target.value })}
                                        />
                                    </AdminField>
                                    <AdminField label="Price">
                                        <input type="number" min={0} step="0.01" className={inputClass} value={createForm.data.price} onChange={(e) => createForm.setData('price', Number(e.target.value))} />
                                    </AdminField>
                                    <AdminField label="Currency">
                                        <select className={selectClass} value={createForm.data.currency} onChange={(e) => createForm.setData('currency', e.target.value)}>
                                            {currencies.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </AdminField>
                                    <AdminField label="Billing interval">
                                        <select className={selectClass} value={createForm.data.billing_interval} onChange={(e) => createForm.setData('billing_interval', e.target.value)}>
                                            {intervals.map((i) => (
                                                <option key={i} value={i}>
                                                    {i}
                                                </option>
                                            ))}
                                        </select>
                                    </AdminField>
                                </AdminFormGrid>
                                <AdminFormActions className="mt-4">
                                    <AdminButton type="submit" disabled={createForm.processing}>
                                        Create plan
                                    </AdminButton>
                                </AdminFormActions>
                            </form>
                        </AdminCard>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {form.data.plans.map((plan, planIndex) => {
                            const expanded = openId === plan.id;
                            return (
                                <AdminCard key={plan.id} padding={false} className={expanded ? 'ring-1 ring-slate-900/5' : ''}>
                                    <div className="flex w-full items-center justify-between gap-4 px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => setOpenId(expanded ? null : plan.id)}
                                            className="min-w-0 flex-1 text-left transition hover:opacity-90"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-base font-semibold text-slate-900">{planTitle(plan)}</h2>
                                                <AdminBadge tone={plan.is_active ? 'success' : 'neutral'}>{plan.is_active ? 'Active' : 'Inactive'}</AdminBadge>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {money(plan.price ?? 0)} / {plan.billing_interval || 'monthly'} · {plan.currency} · {plan.slug}
                                            </p>
                                        </button>
                                        <div className="flex shrink-0 items-center gap-3">
                                            <AdminTextButton onClick={() => router.post(`/admin/plans/${plan.id}/archive`)}>Archive</AdminTextButton>
                                            <AdminTextButton onClick={() => setOpenId(expanded ? null : plan.id)} className={expanded ? 'text-slate-900' : ''}>
                                                {expanded ? 'Close' : 'Edit'}
                                            </AdminTextButton>
                                        </div>
                                    </div>
                                    {expanded && (
                                        <div className="border-t border-slate-100 px-5 py-6">
                                            <AdminSection title="Plan details" description="Name, pricing, and catalog visibility." className="mb-8">
                                                <AdminFormGrid cols={4}>
                                                    <AdminField label="Name (EN)">
                                                        <input
                                                            className={inputClass}
                                                            value={plan.name_labels?.en || ''}
                                                            onChange={(e) =>
                                                                updatePlan(planIndex, {
                                                                    name_labels: { ...plan.name_labels, en: e.target.value },
                                                                })
                                                            }
                                                        />
                                                    </AdminField>
                                                    <AdminField label="Price">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            className={inputClass}
                                                            value={plan.price ?? 0}
                                                            onChange={(e) => updatePlan(planIndex, { price: Number(e.target.value) })}
                                                        />
                                                    </AdminField>
                                                    <AdminField label="Currency">
                                                        <select className={selectClass} value={plan.currency} onChange={(e) => updatePlan(planIndex, { currency: e.target.value })}>
                                                            {currencies.map((c) => (
                                                                <option key={c} value={c}>
                                                                    {c}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </AdminField>
                                                    <AdminField label="Billing interval">
                                                        <select
                                                            className={selectClass}
                                                            value={plan.billing_interval || 'monthly'}
                                                            onChange={(e) => updatePlan(planIndex, { billing_interval: e.target.value })}
                                                        >
                                                            {intervals.map((i) => (
                                                                <option key={i} value={i}>
                                                                    {i}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </AdminField>
                                                    <div className="sm:col-span-2 lg:col-span-4">
                                                        <AdminCheckboxField
                                                            label="Active in catalog"
                                                            hint="Inactive plans stay assignable but are hidden from public pricing."
                                                            checked={!!plan.is_active}
                                                            onChange={(e) => updatePlan(planIndex, { is_active: e.target.checked })}
                                                        />
                                                    </div>
                                                </AdminFormGrid>
                                            </AdminSection>

                                            <PlanEntitlementBuilder
                                                catalog={planEntitlementCatalog}
                                                entitlements={plan.entitlements ?? defaultEntitlements}
                                                onChange={(entitlements) => updateEntitlements(planIndex, entitlements)}
                                            />

                                            <AdminFormActions className="mt-8">
                                                <AdminButton type="button" variant="ghost" onClick={() => form.reset()}>
                                                    Reset
                                                </AdminButton>
                                                <AdminButton type="submit" disabled={form.processing}>
                                                    Save plan
                                                </AdminButton>
                                            </AdminFormActions>
                                        </div>
                                    )}
                                </AdminCard>
                            );
                        })}
                    </form>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
