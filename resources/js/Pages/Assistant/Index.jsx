import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Icon from '../../Components/Icon';
import { t } from '../../lib/i18n';

const TRY_PROMPTS = [
    'assistant.try_slow_payer',
    'assistant.try_vat_reserve',
    'assistant.try_open_quotes',
];

export default function AssistantIndex() {
    return (
        <AuthenticatedLayout>
            <div className="offacto-briefings offacto-dash offacto-assistant-page">
                <div className="offacto-brief-edit-ph">
                    <span className="offacto-dash-eyebrow">
                        <Icon name="spark" />
                        {t('assistant.eyebrow')}
                    </span>
                    <h1>{t('assistant.title')}</h1>
                    <p>{t('assistant.lead')}</p>
                </div>

                <div className="offacto-assistant-grid">
                    <div className="offacto-dash-card offacto-assistant-chat">
                        <div className="offacto-assistant-msgs">
                            <div className="offacto-assistant-msg is-assistant">{t('assistant.welcome')}</div>
                        </div>
                        <form
                            className="offacto-assistant-compose"
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <input
                                className="offacto-time-inp"
                                name="q"
                                placeholder={t('assistant.input_placeholder')}
                                aria-label={t('assistant.input_placeholder')}
                            />
                            <button type="submit" className="offacto-btn-p" aria-label={t('assistant.send')}>
                                <Icon name="send" />
                            </button>
                        </form>
                    </div>

                    <div className="offacto-assistant-aside">
                        <div className="offacto-dash-card">
                            <div className="offacto-dash-card-head">
                                <h3>{t('assistant.try_title')}</h3>
                            </div>
                            <div className="offacto-dash-card-body offacto-assistant-try-list">
                                {TRY_PROMPTS.map((key) => (
                                    <button key={key} type="button" className="offacto-brief-btn block">
                                        {t(key)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="offacto-dash-card">
                            <div className="offacto-dash-card-head">
                                <h3>{t('assistant.insights_title')}</h3>
                            </div>
                            <div className="offacto-dash-card-body offacto-assistant-insights">
                                <div className="offacto-assistant-insight">
                                    <Icon name="spark" />
                                    <p>{t('assistant.insight_quotes')}</p>
                                </div>
                                <div className="offacto-assistant-insight">
                                    <Icon name="spark" />
                                    <p>{t('assistant.insight_vat')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
