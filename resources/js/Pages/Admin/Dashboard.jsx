import { Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Dashboard({
    userStats = {},
    companyStats = {},
    serviceStats = {},
    invoiceStats = {},
    recentUsers = [],
    pendingCompanies = [],
    pendingServices = [],
}) {
    const groups = [
        { title: 'Users', stats: userStats },
        { title: 'Companies', stats: companyStats },
        { title: 'Services', stats: serviceStats },
        { title: 'Invoices', stats: invoiceStats },
    ];

    return (
        <AdminLayout title="Admin">
            <h1 className="mb-6 text-2xl font-semibold">Admin overview</h1>
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
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-3 font-semibold">Recent users</h2>
                    <ul className="space-y-2 text-sm">
                        {recentUsers.map((u) => (
                            <li key={u.id}>
                                <Link href={`/admin/users/${u.id}`} className="text-indigo-600">
                                    {u.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-3 font-semibold">Pending companies</h2>
                    <ul className="space-y-2 text-sm">
                        {pendingCompanies.map((c) => (
                            <li key={c.id}>
                                <Link href={`/admin/companies/${c.id}`} className="text-indigo-600">
                                    {c.company_name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-3 font-semibold">Pending services</h2>
                    <ul className="space-y-2 text-sm">
                        {pendingServices.map((s) => (
                            <li key={s.id}>
                                <Link href={`/admin/services/${s.id}`} className="text-indigo-600">
                                    {s.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </AdminLayout>
    );
}
