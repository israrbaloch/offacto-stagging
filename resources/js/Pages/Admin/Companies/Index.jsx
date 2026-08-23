import { Link } from '@inertiajs/react';
import Pagination from '../../../Components/Pagination';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ companies }) {
    const rows = companies?.data || [];
    return (
        <AdminLayout title="Admin companies">
            <h1 className="mb-6 text-2xl font-semibold">Companies</h1>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Company</th>
                            <th className="px-4 py-3">Owner</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((company) => (
                            <tr key={company.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">
                                    <Link href={`/admin/companies/${company.id}`} className="text-indigo-600">
                                        {company.company_name}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">{company.user?.name}</td>
                                <td className="px-4 py-3">{company.status_relation?.name || '—'}</td>
                                <td className="px-4 py-3">{company.is_active ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={companies?.links || []} />
        </AdminLayout>
    );
}
