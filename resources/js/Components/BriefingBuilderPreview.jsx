import { useMemo } from 'react';
import BriefingPhoneQuestions from './BriefingPhoneQuestions';
import BriefingPhoneShell, { BriefingPhoneBadge } from './BriefingPhoneShell';
import { t } from '../lib/i18n';
import { briefingPreviewTotal } from '../lib/briefingPreviewTotal';
import { money } from '../lib/utils';

export default function BriefingBuilderPreview({
    title,
    companyName,
    companyLogoUrl,
    shareUrl,
    basePrice = 0,
    questions = [],
    previewAnswers,
    setPreviewAnswers,
}) {
    const askable = questions.filter((question) => question.type !== 'heading');
    const total = useMemo(
        () => briefingPreviewTotal(questions, previewAnswers, basePrice, { byQuestionId: false }),
        [questions, previewAnswers, basePrice],
    );

    return (
        <BriefingPhoneShell
            shareUrl={shareUrl}
            companyName={companyName}
            companyLogoUrl={companyLogoUrl}
            title={title}
            badge={<BriefingPhoneBadge />}
        >
            <BriefingPhoneQuestions
                mode="builder"
                questions={questions}
                previewAnswers={previewAnswers}
                setPreviewAnswers={setPreviewAnswers}
            />
            {askable.length > 0 ? (
                <div className="offacto-brief-phone-total">
                    <span>{t('briefings.indicative_price')}</span>
                    <b>{money(total)}</b>
                </div>
            ) : null}
            <button type="button" className="offacto-brief-phone-submit" disabled>
                {t('briefings.submit')}
            </button>
        </BriefingPhoneShell>
    );
}
