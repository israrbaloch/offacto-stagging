import { router } from '@inertiajs/react';
import Icon from './Icon';
import { t } from '../lib/i18n';

export const VAT_REGIME_SETTINGS_OPTIONS = [
    {
        value: 'vat_registered',
        labelKey: 'company_settings.vat_regime_registered',
        hintKey: 'company_settings.vat_regime_registered_hint',
    },
    {
        value: 'small_business_exemption',
        labelKey: 'company_settings.vat_regime_small_business',
        hintKey: 'company_settings.vat_regime_small_business_hint',
    },
    {
        value: 'exempt_art44',
        labelKey: 'company_settings.vat_regime_exempt',
        hintKey: 'company_settings.vat_regime_exempt_hint',
    },
    {
        value: 'mixed',
        labelKey: 'company_settings.vat_regime_mixed',
        hintKey: 'company_settings.vat_regime_mixed_hint',
    },
];

export default function CompanySettingsVatPanel({ vatRegime = 'small_business_exemption', settingsBasePath }) {
    const current = vatRegime || 'small_business_exemption';

    const selectRegime = (value) => {
        if (value === current) {
            return;
        }
        router.patch(`${settingsBasePath}/vat`, { vat_regime: value }, { preserveScroll: true });
    };

    return (
        <>
            <div className="offacto-settings-vat-options" role="radiogroup" aria-label={t('company_settings.nav_vat')}>
                {VAT_REGIME_SETTINGS_OPTIONS.map((option) => {
                    const selected = current === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            className={`offacto-settings-vat-option${selected ? ' on' : ''}`}
                            onClick={() => selectRegime(option.value)}
                        >
                            <span className="offacto-settings-vat-radio" aria-hidden />
                            <span className="offacto-settings-vat-option-copy">
                                <b>{t(option.labelKey)}</b>
                                <span>{t(option.hintKey)}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <p className="offacto-settings-vat-foot">
                <Icon name="globe" />
                <span>{t('company_settings.vat_foreign_hint')}</span>
            </p>
        </>
    );
}
