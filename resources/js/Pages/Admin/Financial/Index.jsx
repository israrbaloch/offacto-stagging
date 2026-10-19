import { Link } from '@inertiajs/react';
import { AdminBody, AdminCard, AdminHeader, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function FinancialIndex({ groups = [] }) {
    return (
        <AdminLayout title="Financial documents">
            <AdminPage>
                <AdminHeader
                    eyebrow="Platform"
                    title="Quotations, invoices & financial operations"
                    description="Belgium-focused policies for documents, tax, payments, and compliance. Configure rules here; use Operations to review live data."
                />
                <AdminBody className="space-y-8">
                    {groups.map((group) => (
                        <section key={group.group}>
                            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.group}</h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((item) => {
                                    const href =
                                        item.kind === 'operation'
                                            ? `/admin/financial/operations/${item.id}`
                                            : `/admin/financial/${item.id}`;
                                    return (
                                        <Link key={item.id} href={href} className="group block">
                                            <AdminCard className="h-full transition group-hover:ring-1 group-hover:ring-slate-900/10">
                                                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
                                                <span className="mt-4 inline-block text-xs font-medium text-slate-600 group-hover:text-slate-900">
                                                    {item.kind === 'operation' ? 'Open report →' : 'Configure →'}
                                                </span>
                                            </AdminCard>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
