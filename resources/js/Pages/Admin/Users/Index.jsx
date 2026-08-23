import { Link } from '@inertiajs/react';
import Pagination from '../../../Components/Pagination';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ users }) {
    const rows = users?.data || [];
    return (
        <AdminLayout title="Users">
            <h1 className="mb-6 text-2xl font-semibold">Users</h1>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((user) => (
                            <tr key={user.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">
                                    <Link href={`/admin/users/${user.id}`} className="text-indigo-600">
                                        {user.name}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">{user.is_active ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={users?.links || []} />
        </AdminLayout>
    );
}
