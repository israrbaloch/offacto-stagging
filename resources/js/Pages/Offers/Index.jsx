import { Link, router } from '@inertiajs/react';
import Button from '../../Components/Button';
import Pagination from '../../Components/Pagination';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { customerName, formatDate, money } from '../../lib/utils';

export default function Index({ offers, stats = {} }) {
    const rows = offers?.data || [];

    return (
        <AuthenticatedLayout title="Offers">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Offers</h1>
                <Button href="/offers/create">New offer</Button>
            </div>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                {['open', 'accepted', 'invoiced'].map((key) => (
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
                            <th className="px-4 py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((offer) => (
                            <tr key={offer.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">
                                    <Link href={`/offers/${offer.id}`} className="font-medium text-[var(--company-primary)]">
                                        {offer.offer_number}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">{customerName(offer.customer)}</td>
                                <td className="px-4 py-3">{formatDate(offer.offer_date)}</td>
                                <td className="px-4 py-3">{offer.status_relation?.name || '—'}</td>
                                <td className="px-4 py-3">{money(offer.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={offers?.links || []} />
        </AuthenticatedLayout>
    );
}
