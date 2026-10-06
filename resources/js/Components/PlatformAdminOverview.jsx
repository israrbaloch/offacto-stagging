import { Link } from '@inertiajs/react';
import { t } from '../lib/i18n';

export default function PlatformAdminOverview({
    userStats = {},
    companyStats = {},
    serviceStats = {},
    invoiceStats = {},
    recentUsers = [],
    pendingCompanies = [],
    pendingServices = [],
    compact = false,
}) {
    const groups = [
        { title: t('platform.users'), stats: userStats },
        { title: t('platform.companies'), stats: companyStats },
        { title: t('platform.services'), stats: serviceStats },
        { title: t('platform.invoices'), stats: invoiceStats },
    ];

    return (
        <div className="space-y-6">
            {!compact && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-950">
                    {t('platform.admin_hint')}
                </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {groups.map((group) => (
                    <section key={group.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h2 className="mb-3 font-semibold">{group.title}</h2>
                        <dl className="space-y-1 text-sm">
                            {Object.entries(group.stats).map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                    <dt className="capitalize text-slate-500">{k.replace('_', ' ')}</dt>
                                    <dd>{typeof v === 'number' ? v : String(v)}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-3 font-semibold">{t('platform.recent_users')}</h2>
                    <ul className="space-y-2 text-sm">
                        {recentUsers.map((u) => (
                            <li key={u.id}>
                                <Link href={`/admin/users/${u.id}`} className="text-indigo-600 hover:underline">
                                    {u.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-3 font-semibold">{t('platform.pending_companies')}</h2>
                    <ul className="space-y-2 text-sm">
                        {pendingCompanies.map((c) => (
                            <li key={c.id}>
                                <Link href={`/admin/companies/${c.id}`} className="text-indigo-600 hover:underline">
                                    {c.company_name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <h2 className="font-semibold">{t('platform.pending_services')}</h2>
                        <Link href="/admin/services?status=Pending" className="text-xs font-medium text-indigo-600 hover:underline">
                            {t('common.view_all')}
                        </Link>
                    </div>
                    <ul className="space-y-2 text-sm">
                        {pendingServices.map((s) => (
                            <li key={s.id}>
                                <Link href={`/admin/services/${s.id}`} className="text-indigo-600 hover:underline">
                                    {s.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
