import { Link, router, useForm } from '@inertiajs/react';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { t } from '../../lib/i18n';

const fieldClass =
    'w-full rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100';

function Card({ icon, title, children, className = '' }) {
    return (
        <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
            <div className="mb-5 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon name={icon} className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            </div>
            {children}
        </section>
    );
}

export default function Edit({ user, hasCompany }) {
    const profile = useForm({
        name: user?.name || '',
        email: user?.email || '',
    });
    const destroy = useForm({ password: '' });

    const saveAccount = (e) => {
        e.preventDefault();
        profile.patch('/profile');
    };

    return (
        <AuthenticatedLayout title={t('profile.title')}>
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('profile.title')}</h1>
                    <p className="mt-1 text-sm text-slate-500">{t('profile.account_subtitle')}</p>
                </div>

                {hasCompany && (
                    <Link
                        href="/company/settings"
                        className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 px-5 py-4 text-sm transition hover:border-indigo-300 hover:bg-indigo-50"
                    >
                        <span className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                                <Icon name="building" className="h-5 w-5" />
                            </span>
                            <span>
                                <span className="block font-semibold text-slate-900">{t('company_settings.link_title')}</span>
                                <span className="mt-0.5 block text-slate-600">{t('company_settings.link_body')}</span>
                            </span>
                        </span>
                        <span className="shrink-0 font-medium text-indigo-700">→</span>
                    </Link>
                )}

                <div className="space-y-6">
                    <Card icon="user" title={t('profile.account')}>
                        <form onSubmit={saveAccount} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('profile.full_name')}</span>
                                    <input className={fieldClass} value={profile.data.name} onChange={(e) => profile.setData('name', e.target.value)} />
                                    {profile.errors.name && <span className="mt-1 block text-xs text-rose-600">{profile.errors.name}</span>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('profile.email')}</span>
                                    <input type="email" className={fieldClass} value={profile.data.email} onChange={(e) => profile.setData('email', e.target.value)} />
                                    {profile.errors.email && <span className="mt-1 block text-xs text-rose-600">{profile.errors.email}</span>}
                                </label>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <button type="submit" disabled={profile.processing} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                                    {t('profile.save_account')}
                                </button>
                            </div>
                            <div className="border-t border-slate-100 pt-5">
                                <h3 className="text-sm font-semibold text-slate-900">{t('profile.password_reset')}</h3>
                                <p className="mt-1 text-sm text-slate-500">{t('profile.password_reset_hint')}</p>
                                <button
                                    type="button"
                                    onClick={() => router.post('/profile/password-reset')}
                                    className="mt-3 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                                >
                                    {t('profile.send_reset')}
                                </button>
                            </div>
                        </form>
                    </Card>

                    <Link href="/upgrade" className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm shadow-sm hover:border-indigo-200">
                        <span className="font-semibold text-slate-900">{t('profile.plan_teaser_title')}</span>
                        <p className="mt-1 text-slate-600">{t('profile.plan_teaser_body')}</p>
                    </Link>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        destroy.delete('/profile');
                    }}
                    className="mt-6 flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <h2 className="font-semibold text-rose-700">{t('profile.danger')}</h2>
                        <p className="mt-1 text-sm text-rose-600/80">{t('profile.danger_body')}</p>
                        <input
                            type="password"
                            placeholder={t('profile.confirm_password')}
                            className="mt-3 w-full max-w-xs rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm"
                            value={destroy.data.password}
                            onChange={(e) => destroy.setData('password', e.target.value)}
                        />
                        {destroy.errors.password && <span className="mt-1 block text-xs text-rose-600">{destroy.errors.password}</span>}
                    </div>
                    <button type="submit" disabled={destroy.processing} className="shrink-0 rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100">
                        {t('profile.delete_account')}
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
