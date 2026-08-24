import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

function initials(name) {
    if (!name) return '—';
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

function StatusPill({ tone, children }) {
    const styles = {
        paid: 'bg-emerald-50 text-emerald-700',
        overdue: 'bg-rose-50 text-rose-700',
        sent: 'bg-indigo-50 text-indigo-700',
        draft: 'bg-slate-100 text-slate-600',
    };
    const dots = {
        paid: 'bg-emerald-500',
        overdue: 'bg-rose-500',
        sent: 'bg-indigo-500',
        draft: 'bg-slate-400',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone] || styles.draft}`}>
            {dots[tone] && <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />}
            {children}
        </span>
    );
}

function statusTone(company) {
    const key = String(company.status_relation?.name || '').toLowerCase();
    if (key.includes('approved') || company.is_active) return 'paid';
    if (key.includes('reject') || key.includes('suspend')) return 'overdue';
    if (key.includes('pending')) return 'sent';
    return company.is_active ? 'paid' : 'draft';
}

function StatCard({ label, value, accent }) {
    return (
        <div className={`rounded-2xl border p-5 ${accent ? 'border-rose-100 bg-rose-50/70' : 'border-slate-200 bg-white'}`}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? 'bg-white text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
                <Icon name="building" className="h-5 w-5" />
            </span>
            <div className={`mt-4 text-sm ${accent ? 'font-medium text-rose-600' : 'text-slate-500'}`}>{label}</div>
            <div className="mt-1 font-serif text-2xl font-semibold text-slate-900">{value}</div>
        </div>
    );
}

export default function Index({ companies = [], requireCompanyApproval }) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filter, setFilter] = useState('all');

    const stats = useMemo(() => {
        const active = companies.filter((item) => item.is_active).length;
        const pending = companies.filter((item) => String(item.status_relation?.name || '').toLowerCase().includes('pending')).length;
        const inactive = companies.filter((item) => !item.is_active).length;
        return { total: companies.length, active, pending, inactive };
    }, [companies]);

    const rows = companies.filter((company) => {
        if (filter === 'active') return company.is_active;
        if (filter === 'pending') return String(company.status_relation?.name || '').toLowerCase().includes('pending');
        if (filter === 'inactive') return !company.is_active;
        return true;
    });

    return (
        <AuthenticatedLayout title="Companies">
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Companies</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Switch between the companies you own
                            {requireCompanyApproval ? ' — new companies may need admin approval.' : '.'}
                        </p>
                    </div>
                    <Link
                        href="/companies/create"
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        New Company
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total" value={stats.total} />
                    <StatCard label="Active" value={stats.active} />
                    <StatCard label="Pending" value={stats.pending} />
                    <StatCard label="Inactive" value={stats.inactive} accent />
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-slate-900">Your companies</h2>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{rows.length} total</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFiltersOpen((value) => !value)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            Filter
                        </button>
                    </div>

                    {filtersOpen && (
                        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3 sm:px-6">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'active', label: 'Active' },
                                { id: 'pending', label: 'Pending' },
                                { id: 'inactive', label: 'Inactive' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFilter(item.id)}
                                    className={`rounded-full border px-3 py-1 text-xs ${
                                        filter === item.id ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead>
                                <tr className="border-y border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                                    <th className="px-5 py-3 font-medium sm:px-6">Company</th>
                                    <th className="px-3 py-3 font-medium">Email</th>
                                    <th className="px-3 py-3 font-medium">City</th>
                                    <th className="px-3 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 text-right font-medium sm:px-6">Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                                            No companies yet.
                                        </td>
                                    </tr>
                                )}
                                {rows.map((company) => {
                                    const status = company.status_relation?.name || (company.is_active ? 'Active' : 'Inactive');
                                    return (
                                        <tr key={company.id} className="border-b border-slate-50 last:border-0">
                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                                                        {initials(company.company_name)}
                                                    </span>
                                                    <span className="truncate font-medium text-slate-800">{company.company_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-slate-500">{company.email || '—'}</td>
                                            <td className="px-3 py-4 text-slate-500">{company.city || '—'}</td>
                                            <td className="px-3 py-4">
                                                <StatusPill tone={statusTone(company)}>{status}</StatusPill>
                                            </td>
                                            <td className="px-5 py-4 text-right sm:px-6">
                                                <StatusPill tone={company.is_active ? 'paid' : 'draft'}>{company.is_active ? 'Yes' : 'No'}</StatusPill>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
