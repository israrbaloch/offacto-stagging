import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { t } from '../../lib/i18n';

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function hoursDecimal(seconds) {
    return (seconds / 3600).toFixed(2);
}

export default function TimeIndex({ entries, hourlyServices = [], customers = [], filters = {} }) {
    const [selected, setSelected] = useState([]);
    const [invoiceCustomerId, setInvoiceCustomerId] = useState(filters.customer_id || '');
    const [showManual, setShowManual] = useState(false);

    const manualForm = useForm({
        service_id: hourlyServices[0]?.id || '',
        customer_id: '',
        description: '',
        started_at: '',
        ended_at: '',
        billable: true,
    });

    const toggle = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const billableRows = useMemo(
        () => entries.data?.filter((e) => e.status === 'completed' && e.billable && e.customer_id) ?? [],
        [entries.data],
    );

    const createInvoice = () => {
        if (!invoiceCustomerId || selected.length === 0) return;
        router.post('/invoices/from-time-entries', {
            customer_id: Number(invoiceCustomerId),
            time_entry_ids: selected,
        });
    };

    const submitManual = (e) => {
        e.preventDefault();
        manualForm.post('/time', {
            preserveScroll: true,
            onSuccess: () => {
                manualForm.reset();
                setShowManual(false);
            },
        });
    };

    return (
        <AuthenticatedLayout title={t('time.title')}>
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-2xl font-semibold text-slate-900">{t('time.title')}</h1>
                        <p className="mt-1 text-sm text-slate-500">{t('time.subtitle')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowManual(true)}
                        className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                    >
                        {t('time.log_manual')}
                    </button>
                </div>

                {hourlyServices.length === 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        {t('time.no_hourly_services')}{' '}
                        <Link href="/services/create" className="font-semibold underline">
                            {t('time.add_service')}
                        </Link>
                    </div>
                )}

                {showManual && (
                    <form onSubmit={submitManual} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900">{t('time.log_manual')}</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm">
                                <span className="font-medium text-slate-700">{t('time.hourly_service')}</span>
                                <select
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={manualForm.data.service_id}
                                    onChange={(e) => manualForm.setData('service_id', e.target.value)}
                                >
                                    {hourlyServices.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block text-sm">
                                <span className="font-medium text-slate-700">{t('time.customer')}</span>
                                <select
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={manualForm.data.customer_id}
                                    onChange={(e) => manualForm.setData('customer_id', e.target.value)}
                                >
                                    <option value="">{t('time.select_customer')}</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.org_name || `${c.first_name} ${c.surname}`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block text-sm sm:col-span-2">
                                <span className="font-medium text-slate-700">{t('time.description')}</span>
                                <input
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={manualForm.data.description}
                                    onChange={(e) => manualForm.setData('description', e.target.value)}
                                />
                            </label>
                            <label className="block text-sm">
                                <span className="font-medium text-slate-700">{t('time.started_at')}</span>
                                <input
                                    type="datetime-local"
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={manualForm.data.started_at}
                                    onChange={(e) => manualForm.setData('started_at', e.target.value)}
                                />
                            </label>
                            <label className="block text-sm">
                                <span className="font-medium text-slate-700">{t('time.ended_at')}</span>
                                <input
                                    type="datetime-local"
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    value={manualForm.data.ended_at}
                                    onChange={(e) => manualForm.setData('ended_at', e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button type="submit" disabled={manualForm.processing} className="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white">
                                {t('common.save')}
                            </button>
                            <button type="button" onClick={() => setShowManual(false)} className="rounded-full border px-4 py-2 text-sm">
                                {t('common.cancel')}
                            </button>
                        </div>
                    </form>
                )}

                {selected.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3">
                        <span className="text-sm text-indigo-900">{t('time.selected_count', { count: selected.length })}</span>
                        <select
                            className="rounded-lg border border-indigo-200 px-3 py-1.5 text-sm"
                            value={invoiceCustomerId}
                            onChange={(e) => setInvoiceCustomerId(e.target.value)}
                        >
                            <option value="">{t('time.invoice_customer')}</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.org_name || `${c.first_name} ${c.surname}`}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={createInvoice}
                            disabled={!invoiceCustomerId}
                            className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {t('time.create_invoice')}
                        </button>
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3" />
                                <th className="px-4 py-3">{t('time.col_date')}</th>
                                <th className="px-4 py-3">{t('time.customer')}</th>
                                <th className="px-4 py-3">{t('time.hourly_service')}</th>
                                <th className="px-4 py-3">{t('time.col_duration')}</th>
                                <th className="px-4 py-3">{t('time.col_hours')}</th>
                                <th className="px-4 py-3">{t('time.col_status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.data?.map((entry) => {
                                const canSelect = entry.status === 'completed' && entry.billable && entry.customer_id;
                                const cust = entry.customer;
                                const custLabel = cust ? cust.org_name || `${cust.first_name} ${cust.surname}` : '—';
                                return (
                                    <tr key={entry.id} className="border-b border-slate-100">
                                        <td className="px-4 py-3">
                                            {canSelect && (
                                                <input type="checkbox" checked={selected.includes(entry.id)} onChange={() => toggle(entry.id)} />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{entry.started_at?.slice(0, 16).replace('T', ' ')}</td>
                                        <td className="px-4 py-3">{custLabel}</td>
                                        <td className="px-4 py-3">{entry.service?.name || '—'}</td>
                                        <td className="px-4 py-3">{formatDuration(entry.duration_seconds)}</td>
                                        <td className="px-4 py-3 font-mono">{hoursDecimal(entry.duration_seconds)}</td>
                                        <td className="px-4 py-3 capitalize">{entry.status}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {!entries.data?.length && <p className="px-4 py-8 text-center text-sm text-slate-500">{t('time.empty')}</p>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
