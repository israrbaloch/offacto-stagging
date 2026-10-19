import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { t } from '../../lib/i18n';

export default function SupportNoCompany() {
    return (
        <AuthenticatedLayout title={t('support.title')}>
            <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h1 className="text-lg font-semibold text-slate-900">{t('support.title')}</h1>
                <p className="mt-2 text-sm text-slate-600">{t('support.need_company')}</p>
                <Link href="/companies" className="mt-6 inline-block text-sm font-medium text-slate-900 underline">
                    {t('support.go_companies')}
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}
