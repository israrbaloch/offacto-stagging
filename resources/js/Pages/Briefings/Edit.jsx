import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BriefingBuilderPreview from '../../Components/BriefingBuilderPreview';
import BriefingShareModal from '../../Components/BriefingShareModal';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { useUi } from '../../context/UiContext';
import { t } from '../../lib/i18n';

const BUILDER_QUESTION_TYPES = [
    'single_choice',
    'multiple_choice',
    'quantity',
    'yes_no',
    'date',
    'short_text',
    'long_text',
    'file_upload',
    'voice',
];

function statusLabel(status) {
    const key = `briefings.status.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
}

function statusBadgeClass(status) {
    if (status === 'active') {
        return 'ok';
    }
    return 'grey';
}

function Toggle({ on, onClick, ariaLabel }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={ariaLabel}
            className={`offacto-brief-toggle ${on ? 'on' : ''}`}
            onClick={onClick}
        />
    );
}

function hasChoices(type) {
    return type === 'single_choice' || type === 'multiple_choice';
}

function priced(type) {
    return ['yes_no', 'single_choice', 'multiple_choice', 'quantity'].includes(type);
}

function emptyQuestion(type = 'short_text') {
    return {
        id: null,
        type,
        label: t('briefings.new_question'),
        help_text: '',
        required: false,
        price_override: '',
        options: hasChoices(type)
            ? [
                  { label: t('briefings.option_a'), price: '' },
                  { label: t('briefings.option_b'), price: '' },
              ]
            : [],
    };
}

export default function Edit({ briefing, shareUrl }) {
    const { toast } = useUi();
    const { activeCompany } = usePage().props;

    const form = useForm({
        title: briefing.title || '',
        base_price: briefing.base_price ?? '',
        form_locale: briefing.form_locale || 'auto',
        auto_generate_offer: briefing.auto_generate_offer ?? true,
        ai_writes_intro: briefing.ai_writes_intro ?? true,
        require_nda_before_start: briefing.require_nda_before_start ?? false,
        valid_until_days: briefing.valid_until_days || 14,
        status: briefing.status || 'draft',
        questions: (briefing.questions || []).map((question) => ({
            id: question.id,
            type: question.type,
            label: question.label || '',
            help_text: question.help_text || '',
            required: !!question.required,
            price_override: question.price_override ?? '',
            options: (question.options || []).map((option) => ({
                label: option.label || '',
                price: option.price ?? '',
            })),
        })),
    });

    const [previewAnswers, setPreviewAnswers] = useState({});
    const [shareOpen, setShareOpen] = useState(false);

    const updateQuestion = (index, key, value) => {
        form.setData(
            'questions',
            form.data.questions.map((question, i) => (i === index ? { ...question, [key]: value } : question)),
        );
    };

    const addQuestion = (type) => {
        const questions = [...form.data.questions, emptyQuestion(type)];
        form.setData('questions', questions);
        persist({ questions });
    };

    const persist = (patch = {}, options = {}) => {
        router.put(`/briefings/${briefing.id}`, { ...form.data, ...patch }, {
            preserveScroll: true,
            ...options,
            onSuccess: (...args) => {
                if (patch.status) {
                    form.setData('status', patch.status);
                }
                options.onSuccess?.(...args);
            },
        });
    };

    const save = (patch = {}, options = {}) => persist(patch, options);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success(t('common.copied'), 2500);
        } catch {
            toast.warning(t('common.copy_failed'));
        }
    };

    const typeLabel = (type) => {
        const key = `briefings.question_type.${type}`;
        const translated = t(key);
        return translated === key ? type : translated;
    };

    const removeOption = (questionIndex, optionIndex) => {
        const question = form.data.questions[questionIndex];
        if ((question.options?.length || 0) <= 1) {
            return;
        }
        const options = question.options.filter((_, i) => i !== optionIndex);
        const questions = form.data.questions.map((item, i) => (i === questionIndex ? { ...item, options } : item));
        form.setData('questions', questions);
        persist({ questions });
    };

    const simulateResponse = () => {
        save({}, {
            onSuccess: () => {
                toast.success(t('briefings.simulate_toast'), 3200);
                setTimeout(() => router.visit('/offers/create'), 900);
            },
        });
    };

    return (
        <AuthenticatedLayout title={form.data.title || t('briefings.title')}>
            <div className="offacto-briefings">
                <div className="offacto-brief-edit-ph">
                    <div>
                        <Link href="/briefings" className="offacto-brief-edit-crumb">
                            <Icon name="back" />
                            {t('briefings.title')}
                        </Link>
                        <h1>
                            {form.data.title || t('briefings.untitled')}{' '}
                            <span className={`offacto-status-badge ${statusBadgeClass(form.data.status)} nd`}>
                                {statusLabel(form.data.status)}
                            </span>
                        </h1>
                    </div>
                    <div className="offacto-brief-edit-acts">
                        <button type="button" className="offacto-brief-btn" onClick={copyLink}>
                            <Icon name="link" />
                            {t('briefings.copy_link')}
                        </button>
                        <button type="button" className="offacto-brief-btn" onClick={() => setShareOpen(true)}>
                            <Icon name="send" />
                            {t('briefings.share')}
                        </button>
                        <button
                            type="button"
                            className="offacto-btn-p"
                            disabled={form.processing}
                            onClick={simulateResponse}
                        >
                            <Icon name="spark" />
                            {t('briefings.simulate_response')}
                        </button>
                    </div>
                </div>

                <BriefingShareModal
                    open={shareOpen}
                    onClose={() => setShareOpen(false)}
                    briefingId={briefing.id}
                    shareUrl={shareUrl}
                />

                <div className="offacto-brief-edit-grid">
                    <div className="offacto-brief-edit-fg">
                        <div className="offacto-brief-edit-card">
                            <div className="offacto-brief-edit-card-h">
                                <h3>{t('briefings.settings')}</h3>
                            </div>
                            <div className="offacto-brief-edit-card-b offacto-brief-edit-fg">
                                <div className="offacto-brief-edit-fg2">
                                    <label>
                                        <span className="offacto-brief-edit-lbl">{t('briefings.internal_title')}</span>
                                        <input
                                            className="offacto-brief-inp"
                                            value={form.data.title}
                                            onChange={(e) => form.setData('title', e.target.value)}
                                            onBlur={() => save()}
                                        />
                                    </label>
                                    <label>
                                        <span className="offacto-brief-edit-lbl">{t('briefings.base_price')}</span>
                                        <div className="offacto-brief-price offacto-brief-price--full">
                                            <span>€</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={form.data.base_price}
                                                onChange={(e) => form.setData('base_price', e.target.value)}
                                                onBlur={() => save()}
                                            />
                                        </div>
                                    </label>
                                </div>
                                <div className="offacto-brief-edit-fg2">
                                    <label>
                                        <span className="offacto-brief-edit-lbl">{t('briefings.quote_valid_days')}</span>
                                        <input
                                            className="offacto-brief-inp"
                                            type="number"
                                            min="1"
                                            value={form.data.valid_until_days}
                                            onChange={(e) => form.setData('valid_until_days', e.target.value)}
                                            onBlur={() => save()}
                                        />
                                    </label>
                                    <label>
                                        <span className="offacto-brief-edit-lbl">{t('briefings.form_language')}</span>
                                        <select
                                            className="offacto-brief-inp"
                                            value={form.data.form_locale}
                                            onChange={(e) => {
                                                const form_locale = e.target.value;
                                                form.setData('form_locale', form_locale);
                                                persist({ form_locale });
                                            }}
                                        >
                                            <option value="auto">{t('briefings.form_language_auto')}</option>
                                            <option value="nl">NL</option>
                                            <option value="fr">FR</option>
                                            <option value="en">EN</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="offacto-brief-row">
                                    <span>{t('briefings.auto_generate_offer')}</span>
                                    <Toggle
                                        ariaLabel={t('briefings.auto_generate_offer')}
                                        on={!!form.data.auto_generate_offer}
                                        onClick={() => {
                                            const auto_generate_offer = !form.data.auto_generate_offer;
                                            form.setData('auto_generate_offer', auto_generate_offer);
                                            persist({ auto_generate_offer });
                                        }}
                                    />
                                </div>
                                <div className="offacto-brief-row">
                                    <span>{t('briefings.ai_writes_intro')}</span>
                                    <Toggle
                                        ariaLabel={t('briefings.ai_writes_intro')}
                                        on={!!form.data.ai_writes_intro}
                                        onClick={() => {
                                            const ai_writes_intro = !form.data.ai_writes_intro;
                                            form.setData('ai_writes_intro', ai_writes_intro);
                                            persist({ ai_writes_intro });
                                        }}
                                    />
                                </div>
                                <div className="offacto-brief-row">
                                    <span>{t('briefings.require_nda_before_start')}</span>
                                    <Toggle
                                        ariaLabel={t('briefings.require_nda_before_start')}
                                        on={!!form.data.require_nda_before_start}
                                        onClick={() => {
                                            const require_nda_before_start = !form.data.require_nda_before_start;
                                            form.setData('require_nda_before_start', require_nda_before_start);
                                            persist({ require_nda_before_start });
                                        }}
                                    />
                                </div>
                                {form.data.status !== 'active' && (
                                    <div className="offacto-brief-row">
                                        <span>{t('briefings.publish')}</span>
                                        <button
                                            type="button"
                                            className="offacto-brief-btn-sm"
                                            onClick={() => save({ status: 'active' })}
                                        >
                                            {t('briefings.activate')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="offacto-brief-edit-card">
                            <div className="offacto-brief-edit-card-h">
                                <h3>{t('briefings.questions_price_rules')}</h3>
                                <div className="offacto-brief-edit-acts">
                                    {BUILDER_QUESTION_TYPES.map((type) => (
                                        <button key={type} type="button" className="offacto-brief-btn-sm" onClick={() => addQuestion(type)}>
                                            <Icon name="plus" />
                                            {typeLabel(type)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="offacto-brief-edit-card-b offacto-brief-edit-fg" style={{ gap: 10 }}>
                                {form.data.questions.length === 0 && (
                                    <p className="offacto-brief-meta">{t('briefings.add_questions_hint')}</p>
                                )}
                                {form.data.questions.map((question, index) => (
                                    <div key={question.id || `new-${index}`} className="offacto-brief-qitem">
                                        <span className="grip" aria-hidden="true">
                                            <Icon name="grip" />
                                        </span>
                                        <div className="offacto-brief-qitem-body">
                                            <div className="offacto-brief-qitem-head">
                                                <input
                                                    className="offacto-brief-inp"
                                                    value={question.label}
                                                    placeholder={t('briefings.label')}
                                                    onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                                                    onBlur={() => save()}
                                                />
                                                <span className="offacto-status-badge grey nd">{typeLabel(question.type)}</span>
                                            </div>
                                            {question.type !== 'heading' && (
                                                <div className="offacto-brief-row mt-2">
                                                    <span>{t('briefings.required')}</span>
                                                    <Toggle
                                                        ariaLabel={t('briefings.required')}
                                                        on={!!question.required}
                                                        onClick={() => {
                                                            const required = !question.required;
                                                            const questions = form.data.questions.map((item, i) =>
                                                                i === index ? { ...item, required } : item,
                                                            );
                                                            form.setData('questions', questions);
                                                            persist({ questions });
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {hasChoices(question.type) && (
                                                <div className="mt-2">
                                                    {(question.options || []).map((option, optionIndex) => (
                                                        <div key={optionIndex} className="offacto-brief-opt">
                                                            <span style={{ color: 'var(--dash-muted)' }}>○</span>
                                                            <input
                                                                className="offacto-brief-inp"
                                                                placeholder={t('briefings.choice_label')}
                                                                value={option.label}
                                                                onChange={(e) => {
                                                                    const options = [...question.options];
                                                                    options[optionIndex] = { ...options[optionIndex], label: e.target.value };
                                                                    updateQuestion(index, 'options', options);
                                                                }}
                                                                onBlur={() => save()}
                                                            />
                                                            <div className="offacto-brief-price">
                                                                <span>+€</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={option.price}
                                                                    onChange={(e) => {
                                                                        const options = [...question.options];
                                                                        options[optionIndex] = { ...options[optionIndex], price: e.target.value };
                                                                        updateQuestion(index, 'options', options);
                                                                    }}
                                                                    onBlur={() => save()}
                                                                />
                                                            </div>
                                                            {(question.options || []).length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    className="offacto-brief-opt-remove"
                                                                    aria-label={t('briefings.remove_option')}
                                                                    onClick={() => removeOption(index, optionIndex)}
                                                                >
                                                                    <Icon name="trash" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="offacto-brief-add-opt"
                                                        onClick={() =>
                                                            updateQuestion(index, 'options', [
                                                                ...(question.options || []),
                                                                { label: t('briefings.option'), price: '' },
                                                            ])
                                                        }
                                                    >
                                                        + {t('briefings.option')}
                                                    </button>
                                                </div>
                                            )}
                                            {priced(question.type) && !hasChoices(question.type) && (
                                                <div className="offacto-brief-opt">
                                                    <span className="offacto-brief-meta" style={{ margin: 0 }}>
                                                        {question.type === 'quantity'
                                                            ? t('briefings.price_per_unit')
                                                            : t('briefings.if_yes_add')}
                                                    </span>
                                                    <div className="offacto-brief-price">
                                                        <span>{question.type === 'quantity' ? '€' : '+€'}</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={question.price_override}
                                                            onChange={(e) => updateQuestion(index, 'price_override', e.target.value)}
                                                            onBlur={() => save()}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {question.type === 'date' && (
                                                <p className="offacto-brief-meta offacto-brief-date-rule">
                                                    <Icon name="spark" />
                                                    {t('briefings.date_rush_rule')}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="x"
                                            aria-label={t('briefings.delete')}
                                            onClick={() => {
                                                const questions = form.data.questions.filter((_, i) => i !== index);
                                                form.setData('questions', questions);
                                                persist({ questions });
                                            }}
                                        >
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <BriefingBuilderPreview
                        title={form.data.title}
                        companyName={activeCompany?.company_name || briefing.company?.company_name}
                        companyLogoUrl={activeCompany?.invoice_logo_url}
                        shareUrl={shareUrl}
                        basePrice={form.data.base_price}
                        questions={form.data.questions}
                        previewAnswers={previewAnswers}
                        setPreviewAnswers={setPreviewAnswers}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
