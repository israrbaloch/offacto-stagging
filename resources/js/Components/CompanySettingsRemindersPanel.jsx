import { router, useForm } from '@inertiajs/react';
import { t } from '../lib/i18n';

const STAGE_TITLE_KEYS = [
    'company_settings.reminder_stage_friendly',
    'company_settings.reminder_stage_second',
    'company_settings.reminder_stage_final',
];

function ReminderToggle({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`offacto-invoice-toggle${checked ? ' on' : ''}`}
        />
    );
}

export default function CompanySettingsRemindersPanel({ reminders = {}, settingsBasePath }) {
    const initialStages =
        reminders.stages?.length > 0
            ? reminders.stages
            : [
                  { days: 3, body: '' },
                  { days: 10, body: '' },
                  { days: 20, body: '' },
              ];

    const form = useForm({
        automated_reminders_enabled: reminders.automated_reminders_enabled ?? true,
        stages: initialStages.map((row) => ({
            days: row.days ?? 7,
            body: row.body ?? '',
        })),
        grace_days: reminders.grace_days ?? 0,
    });

    const updateStage = (index, patch) => {
        const next = form.data.stages.map((row, i) => (i === index ? { ...row, ...patch } : row));
        form.setData('stages', next);
    };

    const save = (e) => {
        e.preventDefault();
        router.patch(
            `${settingsBasePath}/reminders`,
            {
                automated_reminders_enabled: form.data.automated_reminders_enabled,
                stages: form.data.stages,
                grace_days: Number(form.data.grace_days) || 0,
            },
            { preserveScroll: true },
        );
    };

    return (
        <div className="offacto-dash-card offacto-settings-card offacto-settings-reminders-card">
            <form onSubmit={save}>
                <div className="offacto-dash-card-head offacto-settings-reminders-card-head">
                    <div>
                        <h3>{t('company_settings.reminders_title')}</h3>
                        <p className="offacto-settings-hint">{t('company_settings.reminders_desc')}</p>
                    </div>
                    <ReminderToggle
                        label={t('company_settings.reminders_enabled')}
                        checked={!!form.data.automated_reminders_enabled}
                        onChange={(v) => form.setData('automated_reminders_enabled', v)}
                    />
                </div>

                <div className="offacto-dash-card-body offacto-settings-body offacto-settings-reminders">
                    <div className={`offacto-settings-reminders-stages${form.data.automated_reminders_enabled ? '' : ' is-off'}`}>
                        {form.data.stages.map((stage, index) => (
                            <article key={index} className="offacto-settings-reminder-card">
                                <header className="offacto-settings-reminder-card-head">
                                    <span className="offacto-settings-reminder-seq">{index + 1}</span>
                                    <h4>{t(STAGE_TITLE_KEYS[index] || 'company_settings.reminder_stage_n', { n: index + 1 })}</h4>
                                    <label className="offacto-settings-reminder-timing">
                                        <input
                                            type="number"
                                            min={1}
                                            max={365}
                                            value={stage.days}
                                            onChange={(e) => updateStage(index, { days: Number(e.target.value) || 1 })}
                                            className="offacto-settings-reminder-days-inp"
                                        />
                                        <span>{t('company_settings.reminder_days_after_due')}</span>
                                    </label>
                                </header>
                                <textarea
                                    className="offacto-settings-reminder-body"
                                    value={stage.body}
                                    onChange={(e) => updateStage(index, { body: e.target.value })}
                                    rows={4}
                                />
                            </article>
                        ))}
                    </div>

                    <p className="offacto-settings-reminder-vars">{t('company_settings.reminder_variables')}</p>

                    <div className="offacto-settings-save">
                        <button type="submit" className="offacto-btn-p" disabled={form.processing}>
                            {form.processing ? t('common.saving') : t('company_settings.save_reminders')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
