import { Link } from '@inertiajs/react';
import Button from '../../Components/Button';
import Pagination from '../../Components/Pagination';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { customerName, formatDate, money } from '../../lib/utils';

export default function Index({ invoices, stats = {} }) {
    const rows = invoices?.data || [];

    return (
        <AuthenticatedLayout title="Invoices">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Invoices</h1>
                <Button href="/invoices/create">New invoice</Button>
            </div>
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
                {['draft', 'sent', 'paid', 'overdue'].map((key) => (
                    <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-sm capitalize text-slate-500">{key}</div>
                        <div className="mt-1 text-xl font-semibold">{money(stats[key])}</div>
                    </div>
                ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Number</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((invoice) => (
                            <tr key={invoice.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">
                                    <Link href={`/invoices/${invoice.id}`} className="font-medium text-[var(--company-primary)]">
                                        {invoice.invoice_number}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">{customerName(invoice.customer)}</td>
                                <td className="px-4 py-3">{formatDate(invoice.invoice_date)}</td>
                                <td className="px-4 py-3">{invoice.status_relation?.name || '—'}</td>
                                <td className="px-4 py-3">{invoice.payment_status}</td>
                                <td className="px-4 py-3">{money(invoice.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={invoices?.links || []} />
        </AuthenticatedLayout>
    );
}
