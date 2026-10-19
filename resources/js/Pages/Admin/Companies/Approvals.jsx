import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { AdminBadge, AdminBody, AdminButton, AdminCard, AdminHeader, AdminPage, inputClass } from '../../../Components/Admin/ui';
import Pagination from '../../../Components/Pagination';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

export default function AdminCompanyApprovals({ companies, pendingMeta = {} }) {
    const [activeId, setActiveId] = useState(null);
    const [reason, setReason] = useState('');
    const infoForm = useForm({ message: '' });

    const act = (companyId, action) => {
        const body = action === 'request-info' ? { message: infoForm.data.message } : { reason: reason || undefined };
        router.post(`/admin/companies/${companyId}/${action}`, body, {
            preserveScroll: true,
            onSuccess: () => {
                setActiveId(null);
                setReason('');
                infoForm.reset();
            },
        });
    };

    return (
        <AdminLayout title="Approvals">
            <AdminPage>
                <AdminHeader
                    eyebrow="Directory"
                    title="Company approvals"
                    description={`${pendingMeta.total ?? 0} pending registration(s) platform-wide.`}
                    backHref="/admin/companies"
                    backLabel="Companies"
                />
                <AdminBody className="space-y-4">
                    {(companies?.data || []).map((company) => (
                        <AdminCard key={company.id} padding={false}>
                            <div className="px-5 py-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">{company.company_name}</h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {company.owner?.name} · {company.email}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-400">
                                            VAT {company.vat_number} · {formatDate(company.created_at)} · {company.city}, {company.country}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AdminBadge tone="warning">Pending</AdminBadge>
                                        <Link href={`/admin/companies/${company.id}`} className="text-sm font-medium text-slate-700 hover:underline">
                                            Profile
                                        </Link>
                                    </div>
                                </div>

                                {activeId === company.id ? (
                                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Reason for audit (approve / reject)"
                                            rows={2}
                                            className={inputClass}
                                        />
                                        <textarea
                                            value={infoForm.data.message}
                                            onChange={(e) => infoForm.setData('message', e.target.value)}
                                            placeholder="Message when requesting additional information"
                                            rows={2}
                                            className={inputClass}
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            <AdminButton variant="accent" onClick={() => act(company.id, 'approve')}>
                                                Approve
                                            </AdminButton>
                                            <AdminButton variant="danger" onClick={() => act(company.id, 'reject')}>
                                                Reject
                                            </AdminButton>
                                            <AdminButton variant="secondary" onClick={() => act(company.id, 'request-info')}>
                                                Request info
                                            </AdminButton>
                                            <AdminButton variant="ghost" onClick={() => setActiveId(null)}>
                                                Cancel
                                            </AdminButton>
                                        </div>
                                    </div>
                                ) : (
                                    <AdminButton className="mt-4" variant="primary" onClick={() => setActiveId(company.id)}>
                                        Review
                                    </AdminButton>
                                )}
                            </div>
                        </AdminCard>
                    ))}
                    {(companies?.data || []).length === 0 && (
                        <p className="text-center text-sm text-slate-400">No companies awaiting approval.</p>
                    )}
                    <Pagination links={companies?.links || []} />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
