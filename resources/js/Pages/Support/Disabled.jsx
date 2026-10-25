import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { t } from '../../lib/i18n';

export default function SupportDisabled() {
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
                        <p>{t('support.portal_disabled')}</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
