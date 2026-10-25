import { Link } from '@inertiajs/react';
import { AuthDiamond } from '../Layouts/AuthSplitLayout';
import { t } from '../lib/i18n';

export default function CompanySettingsBrandingCustomTemplatesCta() {
    return (
        <div className="offacto-settings-custom-cta">
            <AuthDiamond size={56} className="offacto-settings-custom-cta-deco" />
            <div className="offacto-settings-custom-cta-copy">
                <b>{t('company_settings.custom_templates_title')}</b>
                <span>{t('company_settings.custom_templates_body')}</span>
            </div>
            <Link href="/support" className="offacto-settings-custom-cta-btn">
                {t('company_settings.custom_templates_contact')}
            </Link>
        </div>
    );
}
