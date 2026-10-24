import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import FlashToaster from '../../Components/FlashToaster';
import BriefingPhoneQuestions from '../../Components/BriefingPhoneQuestions';
import BriefingPhoneShell from '../../Components/BriefingPhoneShell';
import { briefingPreviewTotal } from '../../lib/briefingPreviewTotal';
import { t } from '../../lib/i18n';
import { money } from '../../lib/utils';

export default function Public({ briefing, token, submitted = false, canSubmit = false }) {
    const flash = usePage().props.flash;
    const done = submitted || flash?.status === 'briefing-submitted';
    const askable = (briefing.questions || []).filter((question) => question.type !== 'heading');
    const form = useForm({
        respondent_name: '',
        respondent_email: '',
        answers: {},
        answer_files: {},
    });

    const setAnswer = (id, value) => {
        form.setData('answers', { ...form.data.answers, [id]: value });
    };

    const setFile = (id, file) => {
        form.setData('answer_files', { ...form.data.answer_files, [id]: file });
    };

    const total = useMemo(
        () => briefingPreviewTotal(briefing.questions || [], form.data.answers, briefing.base_price ?? 0, { byQuestionId: true }),
        [briefing.questions, briefing.base_price, form.data.answers],
    );

    const submit = (e) => {
        e.preventDefault();
        form.post(`/b/${token}`, { forceFormData: true });
    };

    return (
        <div className="offacto-briefings offacto-brief-public-page">
            <Head title={briefing.title || 'Briefing'} />
            <FlashToaster />

            {done ? (
                <BriefingPhoneShell
                    layout="web"
                    companyName={briefing.company?.name}
                    companyLogoUrl={briefing.company?.logo_url}
                    title={briefing.title}
                >
                    <div className="offacto-brief-public-thanks">
                        <h2>{t('briefings.thank_you')}</h2>
                        <p>{t('briefings.thank_you_body')}</p>
                    </div>
                </BriefingPhoneShell>
            ) : (
                <form onSubmit={submit}>
                    <BriefingPhoneShell
                        layout="web"
                        companyName={briefing.company?.name}
                        companyLogoUrl={briefing.company?.logo_url}
                        title={briefing.title}
                    >
                        <div className="offacto-brief-phone-q">
                            <b>{t('briefings.your_name')} *</b>
                            <input
                                className="offacto-brief-inp"
                                value={form.data.respondent_name}
                                onChange={(e) => form.setData('respondent_name', e.target.value)}
                                required
                            />
                            {form.errors.respondent_name ? (
                                <span className="offacto-brief-field-error">{form.errors.respondent_name}</span>
                            ) : null}
                        </div>
                        <div className="offacto-brief-phone-q">
                            <b>{t('briefings.your_email')} *</b>
                            <input
                                type="email"
                                className="offacto-brief-inp"
                                value={form.data.respondent_email}
                                onChange={(e) => form.setData('respondent_email', e.target.value)}
                                required
                            />
                            {form.errors.respondent_email ? (
                                <span className="offacto-brief-field-error">{form.errors.respondent_email}</span>
                            ) : null}
                        </div>

                        <BriefingPhoneQuestions
                            mode="public"
                            questions={briefing.questions || []}
                            publicAnswers={form.data.answers}
                            setPublicAnswer={setAnswer}
                            answerFiles={form.data.answer_files}
                            setAnswerFile={setFile}
                            errors={form.errors}
                        />

                        {askable.length > 0 ? (
                            <div className="offacto-brief-phone-total">
                                <span>{t('briefings.indicative_price')}</span>
                                <b>{money(total)}</b>
                            </div>
                        ) : null}

                        {!canSubmit ? (
                            <p className="offacto-brief-preview-only">{t('briefings.preview_only')}</p>
                        ) : null}

                        <button
                            type="submit"
                            className="offacto-brief-phone-submit"
                            disabled={!canSubmit || form.processing}
                        >
                            {form.processing ? t('briefings.submitting') : t('briefings.submit')}
                        </button>
                    </BriefingPhoneShell>
                </form>
            )}
        </div>
    );
}
