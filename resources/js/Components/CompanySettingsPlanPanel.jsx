import { useForm } from '@inertiajs/react';
import Icon from './Icon';
import { t } from '../lib/i18n';

function planCardFeatures(plan) {
    const key = `company_settings.plan_features_${plan.id}`;
    const translated = t(key);
    if (translated && translated !== key) {
        return translated.split('|').map((line) => line.trim()).filter(Boolean);
    }

    return (plan.features || []).slice(0, 3);
}

function PlanCard({ plan, onSelect, processing, checkoutDisabled }) {
    const selected = plan.is_current;
    const downgradeLocked = !plan.can_select && !selected;
    const featured = plan.highlight;
    const features = planCardFeatures(plan);
    const usePrimaryBtn = featured && !selected && !downgradeLocked;

    return (
        <article
            className={`offacto-settings-plan-tile${featured ? ' is-featured' : ''}${selected ? ' is-current' : ''}`}
        >
            <div className="offacto-settings-plan-tile-inner">
                <b className="offacto-settings-plan-name">{plan.name}</b>
                <p className="offacto-settings-plan-val">
                    {plan.price}
                    <span> /{t('upgrade.month')}</span>
                </p>
                <div className="offacto-settings-plan-features">
                    {features.map((line) => (
                        <div key={line} className="offacto-settings-plan-feature">
                            <Icon name="check" />
                            <span>{line}</span>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    className={`offacto-brief-btn block${usePrimaryBtn ? ' p' : ''}`}
                    disabled={processing || selected || checkoutDisabled || downgradeLocked}
                    onClick={() => onSelect(plan.id)}
                >
                    {selected
                        ? t('upgrade.current_plan')
                        : downgradeLocked
                          ? t('upgrade.downgrade_not_available')
                          : t('company_settings.plan_choose')}
                </button>
            </div>
        </article>
    );
}

export default function CompanySettingsPlanPanel({ plan = {} }) {
    const form = useForm({ plan: '' });
    const plans = plan.plans || [];
    const paymentConfigured = plan.payment_configured !== false;

    const selectPlan = (planId) => {
        form.setData('plan', planId);
        form.post('/upgrade', { preserveScroll: true });
    };

    const showTrialBadge =
        !plan.subscription_valid && plan.trial_days_left !== null && plan.trial_days_total !== null;

    return (
        <div className="offacto-dash-card offacto-settings-card">
            <div className="offacto-dash-card-head">
                <h3>{t('company_settings.nav_plan')}</h3>
                {showTrialBadge ? (
                    <span className="offacto-demo-badge warn nd">
                        {t('company_settings.plan_trial_badge', {
                            left: plan.trial_days_left,
                            total: plan.trial_days_total,
                        })}
                    </span>
                ) : null}
                {plan.subscription_valid && plan.current_plan_name ? (
                    <span className="offacto-demo-badge ok nd">{plan.current_plan_name}</span>
                ) : null}
            </div>

            <div className="offacto-dash-card-body offacto-settings-plan-body">
                {!paymentConfigured ? (
                    <p className="offacto-settings-plan-warn">{t('upgrade.payment_not_configured')}</p>
                ) : null}

                <div className="offacto-settings-plan-grid">
                    {plans.map((row) => (
                        <PlanCard
                            key={row.id}
                            plan={row}
                            processing={form.processing}
                            onSelect={selectPlan}
                            checkoutDisabled={!paymentConfigured}
                        />
                    ))}
                </div>

                <p className="offacto-settings-hint offacto-settings-plan-footnote">
                    {t('company_settings.plan_demo_prices_note')}
                </p>
            </div>
        </div>
    );
}
