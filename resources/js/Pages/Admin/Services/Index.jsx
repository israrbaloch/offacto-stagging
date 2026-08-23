import { Link } from '@inertiajs/react';
import Pagination from '../../../Components/Pagination';
import AdminLayout from '../../../Layouts/AdminLayout';
import { money } from '../../../lib/utils';

export default function Index({ services }) {
    const rows = services?.data || [];
    return (
        <AdminLayout title="Admin services">
            <h1 className="mb-6 text-2xl font-semibold">Services</h1>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Company</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((service) => (
                            <tr key={service.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">
                                    <Link href={`/admin/services/${service.id}`} className="text-indigo-600">
                                        {service.name}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">{service.company?.company_name}</td>
                                <td className="px-4 py-3">{money(service.price)}</td>
                                <td className="px-4 py-3">{service.status_relation?.name || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={services?.links || []} />
        </AdminLayout>
    );
}
