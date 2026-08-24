import { Link } from '@inertiajs/react';
import { CashflowChart, DsoBars, PaymentDonut } from '../Components/DashboardCharts';
import Icon from '../Components/Icon';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';

const pendingItems = [
    { title: 'Acme Corp Rebranding', detail: 'Waiting for client approval', status: 'Action Required', tone: 'action' },
    { title: 'Northwind Q3 Proposal', detail: 'Internal review needed', status: 'Draft', tone: 'draft' },
    { title: 'Vertex Labs Onboarding', detail: 'Ready to send', status: 'Draft', tone: 'draft' },
];

const openOffers = [
    { customer: 'Acme Corp', date: 'Oct 12, 2024', status: 'Sent', total: '€ 12,500.00' },
    { customer: 'Global Tech', date: 'Oct 10, 2024', status: 'Draft', total: '€ 8,250.50' },
    { customer: 'Nexus Ind.', date: 'Oct 08, 2024', status: 'Sent', total: '€ 4,100.00' },
    { customer: 'Vertex Labs', date: 'Oct 05, 2024', status: 'Draft', total: '€ 15,900.00' },
];

function StatusPill({ children, tone }) {
    const styles = {
        action: 'bg-indigo-100 text-indigo-700',
        draft: 'bg-slate-100 text-slate-600',
        sent: 'bg-emerald-100 text-emerald-700',
    };

    return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone] || styles.draft}`}>
            {children}
        </span>
    );
}

export default function Dashboard() {
    return (
        <AuthenticatedLayout title="Dashboard">
            <div className="space-y-6">
                <section className="flex flex-col gap-4 rounded-3xl bg-indigo-50 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div>
                        <div className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-400">
                            Total revenue YTD
                        </div>
                        <div className="mt-2 font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                            € 40.397,04
                        </div>
                    </div>
                    <Link
                        href="/offers/create"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        Create Offer
                    </Link>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Pending offers & drafts</h2>
                            <button type="button" className="text-slate-400" aria-label="More">
                                ···
                            </button>
                        </div>
                        <ul className="space-y-3">
                            {pendingItems.map((item) => (
                                <li
                                    key={item.title}
                                    className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <path d="M14 2v6h6" />
                                        </svg>
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-slate-900">{item.title}</div>
                                        <div className="truncate text-sm text-slate-400">{item.detail}</div>
                                    </div>
                                    <StatusPill tone={item.tone}>{item.status}</StatusPill>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-5 text-center">
                            <Link href="/offers" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                View all offers →
                            </Link>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Open offers</h2>
                            <span className="text-slate-400" aria-hidden>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
                                </svg>
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[460px] text-left text-sm">
                                <thead>
                                    <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                                        <th className="pb-3 font-medium">Customer</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {openOffers.map((row) => (
                                        <tr key={row.customer}>
                                            <td className="py-3 font-medium text-slate-800">{row.customer}</td>
                                            <td className="py-3 text-slate-500">{row.date}</td>
                                            <td className="py-3">
                                                <StatusPill tone={row.status === 'Sent' ? 'sent' : 'draft'}>
                                                    {row.status}
                                                </StatusPill>
                                            </td>
                                            <td className="py-3 text-right font-serif text-slate-900">{row.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-medium text-slate-500">Invoicing insights & cashflow forecast</h2>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
                            >
                                Last 12 Months
                            </button>
                            <button
                                type="button"
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
                            >
                                Export
                            </button>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                    Cashflow trajectory
                                </div>
                                <div className="mt-2 flex items-end gap-3">
                                    <div className="font-serif text-4xl font-semibold text-slate-900">$1.24M</div>
                                    <div className="mb-1 text-sm font-medium text-indigo-600">↑ +14.2%</div>
                                </div>
                            </div>
                            <div className="flex gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-indigo-600" /> Revenue
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-slate-400" /> Expenses
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2 w-4 border-t-2 border-dashed border-indigo-600" /> AI Forecast
                                </span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <CashflowChart />
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                Payment status breakdown
                            </div>
                            <div className="mt-6">
                                <PaymentDonut />
                            </div>
                            <div className="mt-6 grid grid-cols-3 text-center text-sm">
                                <div>
                                    <div className="flex items-center justify-center gap-1.5 text-slate-500">
                                        <span className="h-2 w-2 rounded-full bg-indigo-600" /> Paid
                                    </div>
                                    <div className="mt-1 font-semibold text-slate-900">65%</div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center gap-1.5 text-slate-500">
                                        <span className="h-2 w-2 rounded-full bg-slate-300" /> Pending
                                    </div>
                                    <div className="mt-1 font-semibold text-slate-900">25%</div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center gap-1.5 text-slate-500">
                                        <span className="h-2 w-2 rounded-full bg-rose-400" /> Overdue
                                    </div>
                                    <div className="mt-1 font-semibold text-slate-900">10%</div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                Average days to pay (DSO)
                            </div>
                            <div className="mt-1 text-sm text-slate-400">By customer segment</div>
                            <div className="mt-8">
                                <DsoBars />
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
