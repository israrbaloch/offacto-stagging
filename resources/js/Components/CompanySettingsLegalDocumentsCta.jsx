import { Link } from '@inertiajs/react';
import Icon from './Icon';
import { t } from '../lib/i18n';

export default function CompanySettingsLegalDocumentsCta() {
    return (
        <div className="offacto-settings-custom-cta offacto-settings-legal-cta">
            <div className="offacto-settings-legal-cta-icon" aria-hidden>
                <Icon name="shield" />
            </div>
            <div className="offacto-settings-custom-cta-copy">
                <b>{t('company_settings.legal_custom_title')}</b>
                <span>{t('company_settings.legal_custom_body')}</span>
            </div>
            <Link href="/support" className="offacto-settings-custom-cta-btn">
                {t('company_settings.custom_templates_contact')}
            </Link>
        </div>
    );
}
