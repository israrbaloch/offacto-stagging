import AdminDomainHub from '../../../Components/Admin/AdminDomainHub';
import { AdminBody, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function ProductIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Product & content">
            <AdminPage>
                <AdminHeader
                    eyebrow="Platform"
                    title="Product & content"
                    description="Help content, announcements, onboarding, and defaults for new workspaces."
                />
                <AdminBody>
                    <AdminDomainHub
                        metricsSlot={
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <AdminMetric label="Published pages" value={metrics.published_pages ?? 0} />
                                <AdminMetric label="Live announcements" value={metrics.active_announcements ?? 0} />
                                <AdminMetric label="Testimonials to review" value={metrics.pending_testimonials ?? 0} accent={!!metrics.pending_testimonials} />
                                <AdminMetric label="Help articles" value={metrics.help_articles ?? 0} />
                                <AdminMetric label="Pilot rollouts" value={metrics.pilot_rollouts ?? 0} />
                                <AdminMetric label="Experiments running" value={metrics.running_experiments ?? 0} />
                                <AdminMetric label="Open product feedback" value={metrics.open_feedback ?? 0} />
                                <AdminMetric label="Public roadmap items" value={metrics.public_roadmap ?? 0} />
                            </div>
                        }
                        groups={groups}
                        resolveHref={(item) => item.href}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
