import AdminDomainHub from '../../../Components/Admin/AdminDomainHub';
import { AdminBody, AdminHeader, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function FinancialIndex({ groups = [] }) {
    return (
        <AdminLayout title="Financial documents">
            <AdminPage>
                <AdminHeader
                    eyebrow="Platform"
                    title="Quotations, invoices & financial operations"
                    description="Belgium-focused rules for documents, tax, and payments. Configure policies here; open reports under Operations for live data."
                />
                <AdminBody>
                    <AdminDomainHub
                        groups={groups}
                        resolveHref={(item) =>
                            item.kind === 'operation' ? `/admin/financial/operations/${item.id}` : `/admin/financial/${item.id}`
                        }
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
