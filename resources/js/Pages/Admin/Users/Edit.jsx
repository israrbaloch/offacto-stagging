import { useForm } from '@inertiajs/react';
import { AdminBody, AdminButton, AdminCard, AdminHeader, AdminLinkButton, AdminPage, inputClass } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function AdminUsersEdit({ profile }) {
    const form = useForm({
        name: profile.name,
        email: profile.email,
        billing_reminders_enabled: profile.billing_reminders_enabled,
    });

    const submit = (event) => {
        event.preventDefault();
        form.patch(`/admin/users/${profile.id}`);
    };

    return (
        <AdminLayout title={`Edit ${profile.name}`}>
            <AdminPage>
                <AdminHeader
                    eyebrow="Directory"
                    title="Edit user"
                    description="Identity and preferences. Security actions live on the user profile."
                    backHref={`/admin/users/${profile.id}`}
                    backLabel="Profile"
                />
                <AdminBody>
                <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
                    <AdminCard title="Identity">
                        <div className="space-y-4">
                            <label className="block text-sm">
                                <span className="mb-1.5 font-medium text-slate-700">Display name</span>
                                <input
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className={inputClass}
                                />
                                {form.errors.name && <span className="mt-1 text-xs text-rose-600">{form.errors.name}</span>}
                            </label>
                            <label className="block text-sm">
                                <span className="mb-1 font-medium text-slate-700">Login email</span>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className={inputClass}
                                />
                                {form.errors.email && <span className="mt-1 text-xs text-rose-600">{form.errors.email}</span>}
                            </label>
                        </div>
                    </AdminCard>

                    <AdminCard title="Preferences">
                        <label className="mt-4 flex items-start gap-3 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.data.billing_reminders_enabled}
                                onChange={(e) => form.setData('billing_reminders_enabled', e.target.checked)}
                                className="mt-0.5 rounded border-slate-300 text-indigo-600"
                            />
                            <span>
                                <span className="font-medium">Subscription billing reminders</span>
                                <span className="mt-0.5 block text-xs text-slate-500">
                                    When enabled, the user receives trial and subscription expiry reminders by email.
                                </span>
                            </span>
                        </label>
                    </AdminCard>

                    <div className="flex gap-3">
                        <AdminButton type="submit" disabled={form.processing}>
                            Save changes
                        </AdminButton>
                        <AdminLinkButton href={`/admin/users/${profile.id}`} variant="secondary">
                            Cancel
                        </AdminLinkButton>
                    </div>
                </form>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
