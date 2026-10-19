import AdminDomainHub from '../../../Components/Admin/AdminDomainHub';
import { AdminBadge, AdminBody, AdminCard, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function IntegrationsIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Integrations">
            <AdminPage>
                <AdminHeader
                    eyebrow="Platform"
                    title="Integrations"
                    description="Payment, postal, Peppol, email, and API connections — plus health checks and failure tracking."
                />
                <AdminBody>
                    <AdminDomainHub
                        metricsSlot={
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <AdminMetric
                                    label="Platform Mollie"
                                    value={metrics.mollie_configured ? (metrics.mollie_mode === 'test' ? 'Test mode' : 'Live mode') : 'Not configured'}
                                    accent={!metrics.mollie_configured}
                                />
                                <AdminMetric label="Peppol" value={metrics.peppol_configured ? 'Configured' : 'Not configured'} accent={!metrics.peppol_configured} />
                                <AdminMetric label="Open integration issues" value={metrics.open_failures ?? 0} accent={!!metrics.open_failures} />
                                <AdminMetric label="Failed payments (7 days)" value={metrics.failed_payments_7d ?? 0} />
                                <AdminMetric label="Companies using Mollie" value={metrics.companies_mollie ?? 0} />
                                <AdminMetric label="Companies using Postbode" value={metrics.companies_postbode ?? 0} />
                                <AdminMetric label="Active webhooks" value={metrics.active_webhooks ?? 0} />
                                <AdminMetric label="Active API keys" value={metrics.active_api_keys ?? 0} />
                            </div>
                        }
                        banner={
                            metrics.mollie_mode === 'test' ? (
                                <AdminCard className="border-sky-100 bg-sky-50/50" padding={true}>
                                    <p className="text-sm text-slate-700">
                                        Platform payments are in <AdminBadge tone="info">test mode</AdminBadge>. Each company still manages its own live or test keys separately.
                                    </p>
                                </AdminCard>
                            ) : null
                        }
                        groups={groups}
                        resolveHref={(item) =>
                            item.kind === 'operation' ? `/admin/integrations/operations/${item.id}` : `/admin/integrations/${item.id}`
                        }
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
