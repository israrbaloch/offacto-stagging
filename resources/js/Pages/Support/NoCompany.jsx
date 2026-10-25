import { Link } from '@inertiajs/react';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { t } from '../../lib/i18n';

export default function SupportNoCompany() {
    return (
        <AuthenticatedLayout title={t('support.title')}>
            <div className="offacto-briefings offacto-dash offacto-support-page">
                <div className="offacto-brief-edit-ph">
                    <span className="offacto-support-eyebrow">
                        <Icon name="help" />
                        {t('nav.support')}
                    </span>
                    <h1>{t('support.title')}</h1>
                </div>
                <div className="offacto-dash-card offacto-support-empty-card">
                    <div className="offacto-dash-card-body offacto-brief-empty">
                        <p>{t('support.need_company')}</p>
                        <Link href="/companies" className="offacto-btn-p">
                            {t('support.go_companies')}
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
