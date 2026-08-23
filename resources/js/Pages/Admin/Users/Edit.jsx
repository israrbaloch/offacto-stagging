import { useForm } from '@inertiajs/react';
import Button from '../../../Components/Button';
import Input, { Select } from '../../../Components/Input';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ user, roles = [] }) {
    const form = useForm({
        name: user.name || '',
        email: user.email || '',
    });
    const roleForm = useForm({
        role: user.roles?.[0]?.id || '',
    });

    return (
        <AdminLayout title={`Edit ${user.name}`}>
            <h1 className="mb-6 text-2xl font-semibold">Edit user</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.patch(`/admin/users/${user.id}`);
                }}
                className="mb-6 max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
            >
                <Input label="Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} />
                <Input label="Email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                <Button type="submit" disabled={form.processing}>
                    Save
                </Button>
            </form>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    roleForm.post(`/admin/users/${user.id}/assign-role`);
                }}
                className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
            >
                <Select
                    label="Role"
                    value={roleForm.data.role}
                    onChange={(e) => roleForm.setData('role', e.target.value)}
                    options={roles.map((r) => ({ value: String(r.id), label: r.name }))}
                />
                <Button type="submit" disabled={roleForm.processing}>
                    Update role
                </Button>
            </form>
        </AdminLayout>
    );
}
