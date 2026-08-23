import { useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Settings({ settings = {} }) {
    const initial = {};
    Object.values(settings).forEach((group) => {
        (group || []).forEach((setting) => {
            initial[setting.key] = setting.type === 'boolean' ? setting.value === '1' || setting.value === true : setting.value ?? '';
        });
    });
    const form = useForm(initial);

    return (
        <AdminLayout title="Settings">
            <h1 className="mb-6 text-2xl font-semibold">Site settings</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const payload = { ...form.data };
                    Object.entries(payload).forEach(([k, v]) => {
                        if (typeof v === 'boolean') payload[k] = v ? '1' : '0';
                    });
                    form.transform(() => payload);
                    form.patch('/admin/settings');
                }}
                className="space-y-6"
            >
                {Object.entries(settings).map(([group, items]) => (
                    <section key={group} className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="mb-4 font-semibold capitalize">{group}</h2>
                        <div className="space-y-3">
                            {(items || []).map((setting) =>
                                setting.type === 'boolean' ? (
                                    <label key={setting.key} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(form.data[setting.key])}
                                            onChange={(e) => form.setData(setting.key, e.target.checked)}
                                        />
                                        {setting.label || setting.key}
                                    </label>
                                ) : (
                                    <Input
                                        key={setting.key}
                                        label={setting.label || setting.key}
                                        value={form.data[setting.key] ?? ''}
                                        onChange={(e) => form.setData(setting.key, e.target.value)}
                                    />
                                ),
                            )}
                        </div>
                    </section>
                ))}
                <Button type="submit" disabled={form.processing}>
                    Save settings
                </Button>
            </form>
        </AdminLayout>
    );
}
