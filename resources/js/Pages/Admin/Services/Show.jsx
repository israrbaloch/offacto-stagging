import { router } from '@inertiajs/react';
import Button from '../../../Components/Button';
import AdminLayout from '../../../Layouts/AdminLayout';
import { money } from '../../../lib/utils';

export default function Show({ service }) {
    return (
        <AdminLayout title={service.name}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{service.name}</h1>
                    <p className="text-sm text-slate-500">
                        {service.company?.company_name} · {money(service.price)} · {service.status_relation?.name}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button href={`/admin/services/${service.id}/edit`} variant="secondary">
                        Edit
                    </Button>
                    <Button onClick={() => router.post(`/admin/services/${service.id}/approve`)}>Approve</Button>
                    <Button variant="danger" onClick={() => router.post(`/admin/services/${service.id}/reject`)}>
                        Reject
                    </Button>
                </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm">{service.description || 'No description.'}</div>
        </AdminLayout>
    );
}
