import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { customerName, money } from '../lib/utils';

export default function Dashboard({ stats = {}, openOffers = [], topCustomers = [] }) {
    const cards = [
        { label: 'Revenue', value: money(stats.revenue) },
        { label: 'Expenses', value: money(stats.expenses) },
        { label: 'Net result', value: money(stats.netResult) },
        { label: 'Open offers', value: money(stats.openOffersTotal) },
    ];

    return (
        <AuthenticatedLayout title="Dashboard">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-sm text-slate-500">
                    {stats.periodStart} — {stats.periodEnd}
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="text-sm text-slate-500">{card.label}</div>
                        <div className="mt-2 text-2xl font-semibold">{card.value}</div>
                    </div>
                ))}
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold">Open offers</h2>
                        <Link href="/offers" className="text-sm text-[var(--company-primary)]">
                            View all
                        </Link>
                    </div>
                    <ul className="space-y-3 text-sm">
                        {openOffers.length === 0 && <li className="text-slate-400">No open offers.</li>}
                        {openOffers.map((offer) => (
                            <li key={offer.id} className="flex justify-between">
                                <span>
                                    {offer.offer_number} · {customerName(offer.customer)}
                                </span>
                                <span>{money(offer.total)}</span>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-4 font-semibold">Top customers</h2>
                    <ul className="space-y-3 text-sm">
                        {topCustomers.length === 0 && <li className="text-slate-400">No customer revenue yet.</li>}
                        {topCustomers.map((customer) => (
                            <li key={customer.id} className="flex justify-between">
                                <span>{customerName(customer)}</span>
                                <span>{money(customer.total_invoiced)}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
