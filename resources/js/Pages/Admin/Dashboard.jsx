import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Icon from '../../Components/Icon';
import AdminLayout from '../../Layouts/AdminLayout';
import { t } from '../../lib/i18n';
import { formatDate, money } from '../../lib/utils';

const emptySummary = {
    companies: {},
    users: {},
    subscriptions: {},
    trials: {},
    failedPayments: {},
    pendingApprovals: 0,
    alerts: 0,
};

function initials(name = '') {
    return (
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('') || 'A'
    );
}

function SearchIcon() {
    return (
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
        </svg>
    );
}

function Metric({ label, value, hint, hintClass = 'text-slate-500', accent = false }) {
    return (
        <section className={`rounded-2xl border bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${accent ? 'border-rose-200/80' : 'border-slate-200/70'}`}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
            <div className={`mt-1.5 text-[1.65rem] font-semibold leading-none tracking-tight ${accent ? 'text-rose-600' : 'text-slate-900'}`}>
                {value}
            </div>
            {hint && <p className={`mt-2 text-xs ${hintClass}`}>{hint}</p>}
        </section>
    );
}

function Card({ title, description, aside, children, className = '' }) {
    return (
        <section className={`rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                    {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
                </div>
                {aside}
            </div>
            <div className="px-5 py-4">{children}</div>
        </section>
    );
}

function statusColor(label = '') {
    const key = label.toLowerCase();
    if (key.includes('approv') || key === 'paid' || key === 'accepted' || key === 'active') return 'bg-emerald-500';
    if (key.includes('pending') || key === 'partial' || key === 'sent' || key === 'draft') return 'bg-amber-400';
    if (key.includes('reject') || key.includes('cancel') || key === 'unpaid' || key.includes('expired')) return 'bg-rose-500';
    return 'bg-indigo-500';
}

function StatusRows({ rows = [] }) {
    const total = rows.reduce((sum, row) => sum + row.count, 0) || 1;
    if (rows.length === 0) {
        return <p className="text-sm text-slate-400">No records yet.</p>;
    }

    return (
        <ul className="space-y-3">
            {rows.map((row) => (
                <li key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-600">{row.label}</span>
                        <span className="font-semibold text-slate-900">{row.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${statusColor(row.label)}`} style={{ width: `${(row.count / total) * 100}%` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

function CountTable({ rows = [] }) {
    if (rows.length === 0) {
        return <p className="text-sm text-slate-400">No records yet.</p>;
    }

    return (
        <ul>
            {rows.map((row) => (
                <li key={row.label} className="flex items-center justify-between border-b border-slate-50 py-2 text-sm last:border-0">
                    <span className="text-slate-600">{row.label}</span>
                    <span className="font-semibold text-slate-900">{row.count}</span>
                </li>
            ))}
        </ul>
    );
}

function RevenueChart({ months = [] }) {
    const max = Math.max(...months.map((month) => month.revenue), 1);
    const ticks = [max, max / 2, 0];

    return (
        <div>
            <div className="flex gap-3">
                <div className="flex h-44 flex-col justify-between pb-6 text-[10px] text-slate-400">
                    {ticks.map((tick) => (
                        <span key={tick}>{tick >= 1000 ? `${Math.round(tick / 1000)}k` : Math.round(tick)}</span>
                    ))}
                </div>
                <div className="flex min-w-0 flex-1 items-end gap-1.5 border-b border-slate-100">
                    {months.map((month) => {
                        const height = (month.revenue / max) * 100;
                        return (
                            <div key={month.label} className="flex h-44 min-w-0 flex-1 flex-col justify-end">
                                {month.revenue > 0 && (
                                    <div className="mb-1 text-center text-[10px] font-medium text-indigo-600">{money(month.revenue)}</div>
                                )}
                                <div className="flex flex-1 items-end">
                                    <div
                                        className="w-full rounded-t-md bg-indigo-500"
                                        style={{ height: `${Math.max(height, month.revenue > 0 ? 8 : 0)}%` }}
                                        title={`${month.label}: ${money(month.revenue)}`}
                                    />
                                </div>
                                <div className="pt-2 text-center text-[10px] text-slate-400">{month.short}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    Subscription revenue
                </span>
                <span>
                    Total collected{' '}
                    <strong className="font-semibold text-slate-900">
                        {money(months.reduce((sum, month) => sum + Number(month.revenue || 0), 0))}
                    </strong>
                </span>
            </div>
        </div>
    );
}

const alertStyle = {
    high: 'border-rose-200 bg-rose-50/70',
    medium: 'border-amber-200 bg-amber-50/80',
    low: 'border-slate-200 bg-slate-50',
};

function paymentTone(status = '') {
    const key = status.toLowerCase();
    if (key === 'failed' || key === 'expired') return 'bg-rose-50 text-rose-700';
    if (key === 'canceled') return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-slate-600';
}

export default function Dashboard({
    generatedAt,
    summary = emptySummary,
    alerts = [],
    months = [],
    companyStatuses = [],
    plans = [],
    chargeStatuses = [],
    pendingCompanies = [],
    failedPayments = [],
    unconverted = [],
    recentUsers = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const needle = query.trim().toLowerCase();

    const companies = summary.companies || {};
    const users = summary.users || {};
    const subscriptions = summary.subscriptions || {};
    const trials = summary.trials || {};
    const failed = summary.failedPayments || {};
    const pending = summary.pendingApprovals ?? 0;

    const visiblePayments = useMemo(() => {
        if (!needle) return failedPayments;
        return failedPayments.filter((payment) =>
            [payment.company, payment.plan, payment.status].join(' ').toLowerCase().includes(needle),
        );
    }, [failedPayments, needle]);

    const visibleUsers = useMemo(() => {
        if (!needle) return recentUsers;
        return recentUsers.filter((person) => [person.name, person.email].join(' ').toLowerCase().includes(needle));
    }, [recentUsers, needle]);

    const visibleUnconverted = useMemo(() => {
        if (!needle) return unconverted;
        return unconverted.filter((company) => String(company.name || '').toLowerCase().includes(needle));
    }, [unconverted, needle]);

    const visiblePending = useMemo(() => {
        if (!needle) return pendingCompanies;
        return pendingCompanies.filter((company) =>
            [company.name, company.owner].join(' ').toLowerCase().includes(needle),
        );
    }, [pendingCompanies, needle]);

    const activePlan = plans[0]?.label;

    return (
        <AdminLayout title="Dashboard">
            <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-50/90">
                <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur-sm lg:px-8">
                    <form
                        className="relative min-w-0 flex-1 max-w-xl"
                        onSubmit={(event) => event.preventDefault()}
                    >
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                            <SearchIcon />
                        </span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search companies, accounts, or plan payments"
                            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </form>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => document.getElementById('admin-alerts')?.scrollIntoView({ behavior: 'smooth' })}
                            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-50"
                            aria-label="Operational alerts"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
                                <path strokeLinecap="round" d="M9 17a3 3 0 0 0 6 0" />
                            </svg>
                            {(summary.alerts ?? 0) > 0 && (
                                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
                            )}
                        </button>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                className="flex items-center gap-3 rounded-full py-1 pl-2 pr-1 hover:bg-slate-50"
                            >
                                <span className="hidden text-right sm:block">
                                    <span className="block text-sm font-semibold text-slate-900">{user?.name}</span>
                                    <span className="block text-xs text-slate-400">Platform admin</span>
                                </span>
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                                    {initials(user?.name)}
                                </span>
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                    <div className="border-b border-slate-100 px-4 py-3">
                                        <div className="truncate text-sm font-semibold text-slate-900">{user?.name}</div>
                                        <div className="truncate text-xs text-slate-400">{user?.email}</div>
                                    </div>
                                    <div className="p-1.5">
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                                        >
                                            <Icon name="logout" className="h-4 w-4" />
                                            {t('topbar.logout')}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-5 lg:px-6 lg:py-6">
                    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Platform overview</h1>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Current data</span>
                            </div>
                            <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                Customers on Offacto: who signed up, who is paying, and which trials have not converted.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white">12 months</span>
                            <button
                                type="button"
                                onClick={() => router.reload()}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Refresh
                            </button>
                            <span className="text-xs text-slate-400">{formatDate(generatedAt)}</span>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <Metric
                            label="Companies"
                            value={companies.total ?? 0}
                            hint={`${companies.active ?? 0} active · ${companies.thisMonth ?? 0} new this month`}
                            hintClass="text-emerald-600"
                        />
                        <Metric
                            label="Registered accounts"
                            value={users.total ?? 0}
                            hint={`${users.thisMonth ?? 0} new this month · ${users.verified ?? 0} verified`}
                        />
                        <Metric
                            label="Paying companies"
                            value={subscriptions.active ?? 0}
                            hint={activePlan ? `${activePlan}${subscriptions.expiringSoon ? ` · ${subscriptions.expiringSoon} ending in 7d` : ''}` : 'No paid plan yet'}
                        />
                        <Metric
                            label="Trials"
                            value={trials.active ?? 0}
                            hint={`${trials.endingSoon ?? 0} ending this week`}
                        />
                        <Metric
                            label="Not converted"
                            value={trials.expired ?? 0}
                            hint="Finished the trial without a plan"
                            hintClass={trials.expired ? 'text-rose-600' : 'text-slate-500'}
                            accent={(trials.expired ?? 0) > 0}
                        />
                        <Metric
                            label="Plan revenue"
                            value={money(subscriptions.revenue)}
                            hint={`${money(subscriptions.thisMonth)} collected this month`}
                            hintClass="text-indigo-600"
                        />
                        <Metric
                            label="Monthly recurring"
                            value={money(subscriptions.recurring)}
                            hint={subscriptions.canceling ? `${subscriptions.canceling} set to cancel` : 'From active plans'}
                        />
                        <Metric
                            label="Failed charges"
                            value={failed.count ?? 0}
                            hint={`${money(failed.amount)} not collected`}
                            hintClass="text-rose-600"
                            accent={(failed.count ?? 0) > 0}
                        />
                        <Metric
                            label="Awaiting approval"
                            value={pending}
                            hint={pending ? 'Companies cannot start until approved' : 'No companies waiting'}
                            hintClass={pending ? 'text-amber-700' : 'text-slate-500'}
                        />
                        <Metric
                            label="Op alerts"
                            value={summary.alerts ?? 0}
                            hint={summary.alerts ? 'Needs attention' : 'Queue clear'}
                            hintClass={summary.alerts ? 'text-rose-600' : 'text-emerald-600'}
                            accent={(summary.alerts ?? 0) > 0}
                        />
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-3">
                        <Card
                            className="xl:col-span-2"
                            title="Subscription revenue"
                            description="Plan payments collected from companies over the last 12 months."
                            aside={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">12 months</span>}
                        >
                            <RevenueChart months={months} />
                        </Card>

                        <Card
                            title="Operational alerts"
                            description="Sign-ups waiting to join, plan charges that failed, and trials that are about to end."
                            aside={
                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                                    {alerts.length} {alerts.length === 1 ? 'item' : 'items'}
                                </span>
                            }
                        >
                            <div id="admin-alerts">
                                {alerts.length === 0 ? (
                                    <p className="text-sm text-slate-400">No operational alerts.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {alerts.map((alert) => (
                                            <li key={alert.title} className={`rounded-xl border px-3 py-3 ${alertStyle[alert.tone] || alertStyle.low}`}>
                                                <div className="text-sm font-semibold text-slate-900">{alert.title}</div>
                                                <p className="mt-1 text-xs leading-5 text-slate-600">{alert.detail}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-3">
                        <Card title="Companies" description="Whether each customer company is approved to use Offacto.">
                            <StatusRows rows={companyStatuses} />
                        </Card>
                        <Card
                            title="Plans being sold"
                            description={`${subscriptions.active ?? 0} paying ${subscriptions.active === 1 ? 'company' : 'companies'} · ${trials.active ?? 0} still in trial.`}
                        >
                            <StatusRows rows={plans} />
                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                                <span className="text-slate-500">Recurring</span>
                                <span className="font-semibold text-slate-900">{money(subscriptions.recurring)} / mo</span>
                            </div>
                        </Card>
                        <Card title="Plan payments" description="How subscription checkouts turned out: paid, still pending, or unsuccessful.">
                            <CountTable rows={chargeStatuses} />
                        </Card>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <Card
                            title="Failed plan payments"
                            description="Subscription checkouts that failed, were canceled, or expired."
                            aside={
                                <span className="text-xs text-slate-400">
                                    {failed.count ?? 0} total
                                </span>
                            }
                        >
                            {visiblePayments.length === 0 ? (
                                <p className="text-sm text-slate-400">{needle ? 'No payments match that search.' : 'No failed subscription payments.'}</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[520px] text-left text-sm">
                                        <thead className="text-[10px] uppercase tracking-wide text-slate-400">
                                            <tr>
                                                <th className="pb-2 font-medium">Company & plan</th>
                                                <th className="pb-2 font-medium">Status</th>
                                                <th className="pb-2 font-medium">Amount</th>
                                                <th className="pb-2 font-medium">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visiblePayments.map((payment) => (
                                                <tr key={payment.id} className="border-t border-slate-100">
                                                    <td className="py-3 pr-3">
                                                        <div className="font-medium text-slate-900">{payment.company || 'Unknown company'}</div>
                                                        <div className="text-xs text-slate-400">{payment.plan}</div>
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${paymentTone(payment.status)}`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pr-3 font-medium text-slate-900">{money(payment.amount)}</td>
                                                    <td className="py-3 text-slate-500">{formatDate(payment.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {(failed.count ?? 0) > visiblePayments.length && !needle && (
                                        <p className="mt-3 text-xs text-slate-400">
                                            Showing {visiblePayments.length} of {failed.count}
                                        </p>
                                    )}
                                </div>
                            )}
                        </Card>

                        <Card title="Customers to follow up" description="Companies waiting for approval, trials that ended without a plan, and the newest accounts.">
                            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Waiting for approval</h3>
                            {visiblePending.length === 0 ? (
                                <p className="text-sm text-slate-400">{needle ? 'No companies match that search.' : 'No companies are waiting.'}</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {visiblePending.map((company) => (
                                        <li key={company.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-slate-900">{company.name}</div>
                                                <div className="truncate text-xs text-slate-400">{company.owner || 'No owner'}</div>
                                            </div>
                                            <span className="shrink-0 text-xs text-slate-400">{formatDate(company.created_at)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <h3 className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Trial ended, no plan</h3>
                            {visibleUnconverted.length === 0 ? (
                                <p className="text-sm text-slate-400">{needle ? 'No companies match that search.' : 'Every finished trial has a plan, or none have ended.'}</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {visibleUnconverted.map((company) => (
                                        <li key={company.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                                            <span className="truncate font-medium text-slate-900">{company.name}</span>
                                            <span className="shrink-0 text-xs text-slate-400">Ended {formatDate(company.ended_at)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <h3 className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Newest accounts</h3>
                            {visibleUsers.length === 0 ? (
                                <p className="text-sm text-slate-400">{needle ? 'No accounts match that search.' : 'No customer accounts yet.'}</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {visibleUsers.map((person) => (
                                        <li key={person.id} className="flex items-center gap-3 py-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                                                {initials(person.name)}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium text-slate-900">{person.name}</div>
                                                <div className="truncate text-xs text-slate-400">{person.email}</div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${person.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    {person.verified ? 'Verified' : 'Unverified'}
                                                </span>
                                                <div className="mt-1 text-[11px] text-slate-400">{formatDate(person.created_at)}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
