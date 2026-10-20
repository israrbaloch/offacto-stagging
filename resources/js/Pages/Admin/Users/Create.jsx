import { useForm } from '@inertiajs/react';
import PlatformAccessFields, { isPlatformRoleName } from '../../../Components/Admin/PlatformAccessFields';
import {
    AdminBody,
    AdminButton,
    AdminCard,
    AdminField,
    AdminHeader,
    AdminLinkButton,
    AdminPage,
    inputClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function AdminUsersCreate({ roles = [], adminCapabilities = [], presets = {} }) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        mark_email_verified: true,
        is_active: true,
        two_factor_enabled: false,
        platform_access: 'specialist',
        admin_permissions: ['admin.support'],
        extra_role_ids: [],
    });

    const workspaceRoles = roles.filter((role) => !isPlatformRoleName(role.name));

    const toggleExtraRole = (id) => {
        const current = form.data.extra_role_ids;
        if (current.includes(id)) {
            form.setData(
                'extra_role_ids',
                current.filter((value) => value !== id),
            );
        } else {
            form.setData('extra_role_ids', [...current, id]);
        }
    };

    const submit = (event) => {
        event.preventDefault();
        form.post('/admin/users');
    };

    return (
        <AdminLayout title="Create user">
            <AdminPage>
                <AdminHeader
                    eyebrow="Directory"
                    title="Create platform user"
                    description="Manual account for Support, Billing, or other admin areas. Sign-in uses /admin/login."
                    backHref="/admin/users"
                    backLabel="Users"
                />
                <AdminBody>
                    <form onSubmit={submit} className="mx-auto grid max-w-3xl gap-6">
                        <AdminCard title="Account">
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <AdminField label="Name" error={form.errors.name}>
                                    <input
                                        className={inputClass}
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        required
                                    />
                                </AdminField>
                                <AdminField label="Email" error={form.errors.email}>
                                    <input
                                        type="email"
                                        className={inputClass}
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        required
                                    />
                                </AdminField>
                                <AdminField label="Password" error={form.errors.password}>
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        className={inputClass}
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        required
                                    />
                                </AdminField>
                                <AdminField label="Confirm password">
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        className={inputClass}
                                        value={form.data.password_confirmation}
                                        onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                </AdminField>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.data.mark_email_verified}
                                        onChange={(e) => form.setData('mark_email_verified', e.target.checked)}
                                    />
                                    Mark email verified (recommended)
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(e) => form.setData('is_active', e.target.checked)}
                                    />
                                    Active account
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.data.two_factor_enabled}
                                        onChange={(e) => form.setData('two_factor_enabled', e.target.checked)}
                                    />
                                    Require two-step verification (TOTP on login)
                                </label>
                            </div>
                        </AdminCard>

                        <AdminCard title="Platform access">
                            <div className="mt-4">
                                <PlatformAccessFields
                                    platformAccess={form.data.platform_access}
                                    onPlatformAccessChange={(value) => form.setData('platform_access', value)}
                                    adminPermissions={form.data.admin_permissions}
                                    onAdminPermissionsChange={(value) => form.setData('admin_permissions', value)}
                                    adminCapabilities={adminCapabilities}
                                    presets={presets}
                                    errors={form.errors}
                                />
                            </div>
                        </AdminCard>

                        {workspaceRoles.length > 0 && (
                            <AdminCard title="Optional workspace roles" description="Usually leave empty for dedicated admin staff.">
                                <div className="mt-3 space-y-2">
                                    {workspaceRoles.map((role) => (
                                        <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={form.data.extra_role_ids.includes(role.id)}
                                                onChange={() => toggleExtraRole(role.id)}
                                            />
                                            {role.name}
                                        </label>
                                    ))}
                                </div>
                            </AdminCard>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <AdminButton type="submit" disabled={form.processing}>
                                Create user
                            </AdminButton>
                            <AdminLinkButton href="/admin/users" variant="secondary">
                                Cancel
                            </AdminLinkButton>
                        </div>
                    </form>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
