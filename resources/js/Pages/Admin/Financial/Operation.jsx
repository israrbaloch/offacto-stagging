import axios from 'axios';
import { useState } from 'react';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminCard,
    AdminHeader,
    AdminMetric,
    AdminPage,
    AdminTable,
    badgeToneFor,
    checkboxClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate, money } from '../../../lib/utils';

export default function FinancialOperation({
    section,
    operation,
    nav = [],
    events = [],
    summary = {},
    items = [],
    deliveries = [],
}) {
    const [confirmExport, setConfirmExport] = useState(false);
    const [exporting, setExporting] = useState(false);

    const downloadAuditExport = async () => {
        const xsrf = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        setExporting(true);
        try {
            const { data, headers } = await axios.post(
                '/admin/financial/audit-export',
                { confirm: true },
                {
                    responseType: 'blob',
                    headers: xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {},
                },
            );
            const disposition = headers['content-disposition'] || '';
            const match = disposition.match(/filename="?([^";]+)"?/i);
            const filename = match?.[1] || 'financial-audit.csv';
            const url = URL.createObjectURL(data);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            anchor.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    return (
        <AdminLayout title={section?.title}>
            <AdminPage>
                <AdminHeader
                    eyebrow="Operations"
                    title={section?.title}
                    description={section?.description}
                    backHref="/admin/financial"
                    backLabel="Financial hub"
                />
                <SettingsSectionNav nav={nav} activeId={operation} basePath="/admin/financial" />
                <AdminBody className="space-y-6">
                    {operation === 'reconciliation' && (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <AdminMetric label="Invoiced (platform)" value={money(summary.invoiced_total ?? 0)} />
                                <AdminMetric label="Payments recorded" value={money(summary.payments_recorded ?? 0)} />
                                <AdminMetric label="Open gap (est.)" value={money(summary.open_gap ?? 0)} accent={!!summary.open_gap} />
                                <AdminMetric label="Unpaid invoices" value={summary.unpaid_invoices ?? 0} hint={`${summary.partial_invoices ?? 0} partial`} />
                            </div>
                            <AdminCard title="Note">
                                <p className="text-sm text-slate-600">{summary.note}</p>
                            </AdminCard>
                        </>
                    )}

                    {operation === 'exceptions' && (
                        <AdminTable columns={['Severity', 'Type', 'Detail']}>
                            {items.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3">
                                        <AdminBadge tone={row.severity === 'high' ? 'danger' : 'warning'}>{row.severity}</AdminBadge>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{row.type}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{row.detail}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'delivery-history' && (
                        <AdminTable columns={['When', 'Document', 'Company', 'Channel', 'Status', 'Reference']}>
                            {deliveries.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 text-sm">{formatDate(row.at)}</td>
                                    <td className="px-4 py-3 text-sm font-medium">{row.document}</td>
                                    <td className="px-4 py-3 text-sm">{row.company}</td>
                                    <td className="px-4 py-3 text-sm">{row.channel}</td>
                                    <td className="px-4 py-3">
                                        <AdminBadge tone={badgeToneFor(row.status)}>{row.status}</AdminBadge>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.reference || '—'}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'version-history' && (
                        <AdminTable columns={['When', 'Action', 'Outcome', 'Detail']}>
                            {events.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 text-sm">{formatDate(row.at)}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                                    <td className="px-4 py-3 text-sm">{row.outcome}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{row.detail}</td>
                                </tr>
                            ))}
                        </AdminTable>
                    )}

                    {operation === 'audit-export' && (
                        <AdminCard title="Generate audit export" description="CSV bundle of document activity and delivery events for authorized review.">
                            <label className="mb-4 flex items-start gap-3 text-sm">
                                <input type="checkbox" className={checkboxClass} checked={confirmExport} onChange={(e) => setConfirmExport(e.target.checked)} />
                                <span>I am authorized to export financial audit data from the platform.</span>
                            </label>
                            <AdminButton disabled={!confirmExport || exporting} onClick={downloadAuditExport}>
                                {exporting ? 'Preparing…' : 'Download CSV export'}
                            </AdminButton>
                        </AdminCard>
                    )}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
