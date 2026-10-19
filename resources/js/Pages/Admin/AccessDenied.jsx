import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { AdminBody, AdminButton, AdminHeader, AdminPage } from '../../Components/Admin/ui';

/** SH-003 — permission denied within admin shell. */
export default function AccessDenied({ message }) {
    return (
        <AdminLayout title="Access denied">
            <Head title="Access denied" />
            <AdminPage>
                <AdminHeader eyebrow="Security" title="Access denied" description={message} />
                <AdminBody className="max-w-lg">
                    <p className="text-sm text-slate-600">If you believe this is an error, contact a platform owner or review your role assignments in the user directory.</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        <AdminButton type="button" variant="primary" onClick={() => window.history.back()}>
                            Go back
                        </AdminButton>
                        <Link href="/admin" className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Admin dashboard
                        </Link>
                    </div>
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
