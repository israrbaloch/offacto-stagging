import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { t } from '../../lib/i18n';

export default function SupportDisabled() {
    return (
        <AuthenticatedLayout title={t('support.title')}>
            <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-lg font-semibold text-slate-900">{t('support.title')}</h1>
                <p className="mt-2 text-sm text-slate-600">{t('support.portal_disabled')}</p>
            </div>
        </AuthenticatedLayout>
    );
}
