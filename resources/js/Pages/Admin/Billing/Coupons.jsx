import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminCard,
    AdminEmpty,
    AdminField,
    AdminFormActions,
    AdminFormGrid,
    AdminHeader,
    AdminPage,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate, money } from '../../../lib/utils';

export default function BillingCoupons({ coupons = [] }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        code: '',
        name: '',
        type: 'percent',
        amount: 10,
        max_redemptions: '',
        valid_until: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/admin/billing/coupons', {
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    return (
        <AdminLayout title="Coupons">
            <AdminPage>
                <AdminHeader
                    eyebrow="Billing"
                    title="Discounts & coupons"
                    description="Percentage or fixed discounts with validity and redemption limits."
                    actions={
                        <AdminButton variant="accent" onClick={() => setOpen((v) => !v)}>
                            {open ? 'Close' : 'New coupon'}
                        </AdminButton>
                    }
                />
                <AdminBody className="space-y-6">
                    {open && (
                        <AdminCard title="Create coupon">
                            <form onSubmit={submit}>
                                <AdminFormGrid cols={2}>
                                    <AdminField label="Code">
                                        <input className={inputClass} value={form.data.code} onChange={(e) => form.setData('code', e.target.value.toUpperCase())} />
                                    </AdminField>
                                    <AdminField label="Display name">
                                        <input className={inputClass} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Type">
                                        <select className={selectClass} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                                            <option value="percent">Percent</option>
                                            <option value="fixed">Fixed amount</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label={form.data.type === 'percent' ? 'Percent off' : 'Discount amount'} hint={form.data.type === 'fixed' ? 'Currency amount (e.g. 10.00)' : undefined}>
                                        <input
                                            type="number"
                                            min={0.01}
                                            step={form.data.type === 'percent' ? 1 : 0.01}
                                            className={inputClass}
                                            value={form.data.amount}
                                            onChange={(e) => form.setData('amount', Number(e.target.value))}
                                        />
                                    </AdminField>
                                </AdminFormGrid>
                                <AdminFormActions className="mt-4">
                                    <AdminButton type="submit" disabled={form.processing}>
                                        Create coupon
                                    </AdminButton>
                                </AdminFormActions>
                            </form>
                        </AdminCard>
                    )}

                    {coupons.length === 0 ? (
                        <AdminEmpty message="No coupons yet. Create one to offer checkout discounts." />
                    ) : (
                        <div className="space-y-3">
                            {coupons.map((c) => (
                                <AdminCard key={c.id} padding={false}>
                                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                                        <div>
                                            <span className="font-mono text-sm font-semibold text-slate-900">{c.code}</span>
                                            <span className="ml-2 text-slate-600">{c.name}</span>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {c.type === 'percent' ? `${c.amount}%` : money(c.amount)} · {c.redemption_count}
                                                {c.max_redemptions ? ` / ${c.max_redemptions}` : ''} redemptions
                                            </p>
                                            {c.valid_until && <p className="text-xs text-slate-400">Valid until {formatDate(c.valid_until)}</p>}
                                        </div>
                                        <AdminBadge tone={c.valid_now ? 'success' : 'neutral'}>{c.valid_now ? 'Valid' : 'Inactive'}</AdminBadge>
                                    </div>
                                </AdminCard>
                            ))}
                        </div>
                    )}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
