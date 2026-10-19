import { Link } from '@inertiajs/react';
import { AdminBody, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function ProductIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Product & content">
            <AdminPage>
                <AdminHeader eyebrow="Platform" title="Product & content management" description="CMS, announcements, rollouts, and workspace defaults." />
                <AdminBody className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminMetric label="Published pages" value={metrics.published_pages ?? 0} />
                        <AdminMetric label="Live announcements" value={metrics.active_announcements ?? 0} />
                        <AdminMetric label="Testimonials pending" value={metrics.pending_testimonials ?? 0} accent={!!metrics.pending_testimonials} />
                        <AdminMetric label="Help articles" value={metrics.help_articles ?? 0} />
                        <AdminMetric label="Pilot rollouts" value={metrics.pilot_rollouts ?? 0} />
                        <AdminMetric label="A/B running" value={metrics.running_experiments ?? 0} />
                        <AdminMetric label="Open feedback" value={metrics.open_feedback ?? 0} />
                        <AdminMetric label="Public roadmap" value={metrics.public_roadmap ?? 0} />
                    </div>

                    {groups.map((group) => (
                        <section key={group.group}>
                            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.group}</h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((item) => (
                                    <Link key={item.id} href={item.href} className="block rounded-2xl border border-slate-200/70 bg-white p-4 transition hover:ring-1 hover:ring-slate-900/10">
                                        <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                                        <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
