import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { t } from '../lib/i18n';

export default function Support() {
    return (
        <AuthenticatedLayout title={t('support.title')}>
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <h1 className="text-xl font-semibold text-slate-900">{t('support.title')}</h1>
                <p className="mt-2 text-sm text-slate-500">{t('support.body')}</p>
            </div>
        </AuthenticatedLayout>
    );
}
