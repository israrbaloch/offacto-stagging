import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { t } from '../../lib/i18n';

export default function Dashboard() {
    return (
        <AuthenticatedLayout title="Staff">
            <h1 className="text-2xl font-semibold">{t('nav.staff_tools')}</h1>
            <p className="mt-2 max-w-xl text-slate-500">
                Staff use the company workspace in the sidebar for customers, quotes, and invoices. Platform admin tasks
                (approving services or companies) live in the admin panel and are only available to admin users.
            </p>
            <Link href="/dashboard" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:underline">
                {t('nav.dashboard')} →
            </Link>
        </AuthenticatedLayout>
    );
}
