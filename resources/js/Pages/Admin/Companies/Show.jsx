import { router } from '@inertiajs/react';
import Button from '../../../Components/Button';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Show({ company }) {
    return (
        <AdminLayout title={company.company_name}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{company.company_name}</h1>
                    <p className="text-sm text-slate-500">
                        {company.email} · {company.status_relation?.name} · {company.is_active ? 'Active' : 'Inactive'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button href={`/admin/companies/${company.id}/edit`} variant="secondary">
                        Edit
                    </Button>
                    <Button onClick={() => router.post(`/admin/companies/${company.id}/approve`)}>Approve</Button>
                    <Button variant="danger" onClick={() => router.post(`/admin/companies/${company.id}/reject`)}>
                        Reject
                    </Button>
                    <Button variant="secondary" onClick={() => router.post(`/admin/companies/${company.id}/toggle-active`)}>
                        Toggle active
                    </Button>
                </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm">
                <p>Owner: {company.user?.name}</p>
                <p>VAT: {company.vat_number || '—'}</p>
                <p>
                    {company.street} {company.house}, {company.postal_code} {company.city}
                </p>
            </div>
        </AdminLayout>
    );
}
