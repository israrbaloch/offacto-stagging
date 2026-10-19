import { Link } from '@inertiajs/react';
import { AdminBadge, AdminBody, AdminCard, AdminHeader, AdminMetric, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function IntegrationsIndex({ metrics = {}, groups = [] }) {
    return (
        <AdminLayout title="Integrations">
            <AdminPage>
                <AdminHeader
                    eyebrow="Platform"
                    title="Integration control center"
                    description="External providers, credentials, webhooks, API access, and operational health."
                />
                <AdminBody className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminMetric
                            label="Mollie (platform)"
                            value={metrics.mollie_configured ? metrics.mollie_mode : 'Not set'}
                            accent={!metrics.mollie_configured}
                        />
                        <AdminMetric label="Peppol" value={metrics.peppol_configured ? 'Configured' : 'Missing'} accent={!metrics.peppol_configured} />
                        <AdminMetric label="Open failures" value={metrics.open_failures ?? 0} accent={!!metrics.open_failures} />
                        <AdminMetric label="Failed payments (7d)" value={metrics.failed_payments_7d ?? 0} />
                        <AdminMetric label="Companies w/ Mollie" value={metrics.companies_mollie ?? 0} />
                        <AdminMetric label="Companies w/ Postbode" value={metrics.companies_postbode ?? 0} />
                        <AdminMetric label="Active webhooks" value={metrics.active_webhooks ?? 0} />
                        <AdminMetric label="Active API keys" value={metrics.active_api_keys ?? 0} />
                    </div>

                    {metrics.mollie_mode === 'test' && (
                        <AdminCard className="border-sky-100 bg-sky-50/50" padding={true}>
                            <p className="text-sm text-slate-700">
                                Platform Mollie is in <AdminBadge tone="info">test</AdminBadge> mode. Live company keys remain separate under each company&apos;s integration settings.
                            </p>
                        </AdminCard>
                    )}

                    {groups.map((group) => (
                        <section key={group.group}>
                            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.group}</h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((item) => {
                                    const href =
                                        item.kind === 'operation'
                                            ? `/admin/integrations/operations/${item.id}`
                                            : `/admin/integrations/${item.id}`;
                                    return (
                                        <Link key={item.id} href={href} className="group block">
                                            <AdminCard className="h-full transition group-hover:ring-1 group-hover:ring-slate-900/10">
                                                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
                                                <span className="mt-4 inline-block text-xs font-medium text-slate-600 group-hover:text-slate-900">
                                                    {item.kind === 'operation' ? 'Open →' : 'Configure →'}
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
