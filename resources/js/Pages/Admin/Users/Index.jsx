import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminFilterBar,
    AdminHeader,
    AdminLinkButton,
    AdminPage,
    AdminTable,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import Pagination from '../../../Components/Pagination';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

export default function AdminUsersIndex({ users, filters = {}, roles = [] }) {
    const [q, setQ] = useState(filters.q || '');
    const [role, setRole] = useState(filters.role || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [verified, setVerified] = useState(filters.verified || 'all');

    const applyFilters = (event) => {
        event.preventDefault();
        router.get('/admin/users', { q, role, status, verified }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Users">
            <AdminPage>
                <AdminHeader
                    eyebrow="Directory"
                    title="Users"
                    description="Search accounts, roles, and access status."
                    actions={
                        <AdminLinkButton href="/admin/users/create" variant="accent">
                            Create user
                        </AdminLinkButton>
                    }
                />
                <AdminBody className="space-y-6">
                    <AdminFilterBar onSubmit={applyFilters}>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Name or email"
                            className={`${inputClass} lg:col-span-2`}
                        />
                        <select value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
                            <option value="">All roles</option>
                            {roles.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Suspended</option>
                        </select>
                        <select value={verified} onChange={(e) => setVerified(e.target.value)} className={selectClass}>
                            <option value="all">Any email</option>
                            <option value="yes">Verified</option>
                            <option value="no">Not verified</option>
                        </select>
                        <div className="flex items-end lg:col-span-4">
                            <AdminButton type="submit">Apply</AdminButton>
                        </div>
                    </AdminFilterBar>

                    <AdminTable columns={['User', 'Roles', 'Status', 'Email', 'Joined', '']}>
                        {(users?.data || []).map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900">{user.name}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map((name) => (
                                            <AdminBadge key={name} tone="info">
                                                {name}
                                            </AdminBadge>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <AdminBadge tone={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Active' : 'Suspended'}</AdminBadge>
                                </td>
                                <td className="px-4 py-3">
                                    <AdminBadge tone={user.email_verified ? 'success' : 'warning'}>
                                        {user.email_verified ? 'Verified' : 'Unverified'}
                                    </AdminBadge>
                                </td>
                                <td className="px-4 py-3 tabular-nums text-slate-600">{formatDate(user.created_at)}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/admin/users/${user.id}`} className="text-sm font-medium text-slate-900 hover:underline">
                                        Open
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </AdminTable>
                    <Pagination links={users?.links || []} />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
