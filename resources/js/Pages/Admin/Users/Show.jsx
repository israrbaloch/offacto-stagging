import { router } from '@inertiajs/react';
import Button from '../../../Components/Button';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Show({ user }) {
    return (
        <AdminLayout title={user.name}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{user.name}</h1>
                    <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="flex gap-2">
                    <Button href={`/admin/users/${user.id}/edit`} variant="secondary">
                        Edit
                    </Button>
                    <Button onClick={() => router.post(`/admin/users/${user.id}/toggle-active`)}>
                        {user.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm">
                <p>Roles: {(user.roles || []).map((r) => r.name).join(', ') || '—'}</p>
                <p className="mt-2">Companies: {(user.companies || []).length}</p>
            </div>
        </AdminLayout>
    );
}
