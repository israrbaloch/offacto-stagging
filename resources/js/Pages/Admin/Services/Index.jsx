import { Link, router } from '@inertiajs/react';
import Pagination from '../../../Components/Pagination';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { money } from '../../../lib/utils';

export default function Index({ services, statuses = [], filters = {} }) {
    const rows = services?.data || [];
    const statusFilter = filters.status || '';

    const applyFilter = (status) => {
        router.get('/admin/services', status ? { status } : {}, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout title="Admin services">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Service approvals</h1>
                    <p className="mt-1 text-sm text-slate-500">Review catalog items submitted by companies.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => applyFilter('')}
                        className={`rounded-full border px-3 py-1 text-xs ${!statusFilter ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'}`}
                    >
                        All
                    </button>
                    {statuses.map((status) => (
                        <button
                            key={status.id}
                            type="button"
                            onClick={() => applyFilter(status.name)}
                            className={`rounded-full border px-3 py-1 text-xs ${
                                statusFilter === status.name
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : 'border-slate-200 text-slate-600'
                            }`}
                        >
                            {status.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Company</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                                    No services match this filter.
                                </td>
                            </tr>
                        )}
                        {rows.map((service) => {
                            const pending = String(service.status_relation?.name || '').toLowerCase() === 'pending';
                            return (
                                <tr key={service.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3">
                                        <Link href={`/admin/services/${service.id}`} className="font-medium text-indigo-600">
                                            {service.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">{service.company?.company_name}</td>
                                    <td className="px-4 py-3">{money(service.price)}</td>
                                    <td className="px-4 py-3">{service.status_relation?.name || '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/admin/services/${service.id}`} className="text-indigo-600 hover:underline">
                                            View
                                        </Link>
                                        {pending && (
                                            <button
                                                type="button"
                                                className="ml-3 font-medium text-emerald-700 hover:underline"
                                                onClick={() => router.post(`/admin/services/${service.id}/approve`)}
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Pagination links={services?.links || []} />
        </AuthenticatedLayout>
    );
}
