import Icon from './Icon';
import { t } from '../lib/i18n';

/**
 * @param {'builder'|'public'} mode
 */
export default function BriefingPhoneQuestions({
    mode = 'builder',
    questions = [],
    previewAnswers = {},
    setPreviewAnswers,
    publicAnswers = {},
    setPublicAnswer,
    answerFiles = {},
    setAnswerFile,
    errors = {},
}) {
    const setBuilderAnswer = (index, value) => {
        setPreviewAnswers?.((prev) => ({ ...prev, [index]: value }));
    };

    const toggleBuilderMulti = (index, optionIndex) => {
        const current = previewAnswers[index] || [];
        const next = current.includes(optionIndex)
            ? current.filter((item) => item !== optionIndex)
            : [...current, optionIndex];
        setBuilderAnswer(index, next);
    };

    const togglePublicMulti = (questionId, optionIndex, options) => {
        const current = publicAnswers[questionId]?.indices || [];
        const next = current.includes(optionIndex)
            ? current.filter((item) => item !== optionIndex)
            : [...current, optionIndex];
        const labels = next.map((i) => options[i]?.label).filter(Boolean);
        setPublicAnswer?.(questionId, { indices: next, labels });
    };

    return questions.map((question, index) => {
        if (question.type === 'heading') {
            return (
                <h4 key={`h-${question.id ?? index}`} className="offacto-brief-phone-q-h">
                    {question.label || '—'}
                </h4>
            );
        }

        const err = mode === 'public' && question.id ? errors[`answers.${question.id}`] : null;

        return (
            <div key={`q-${question.id ?? index}`} className="offacto-brief-phone-q">
                <b>
                    {question.label || t('briefings.question_n', { n: index + 1 })}
                    {question.required ? ' *' : ''}
                </b>

                {question.type === 'single_choice' && (
                    <div className="offacto-brief-chips">
                        {(question.options || []).map((option, optionIndex) => {
                            const selected =
                                mode === 'builder'
                                    ? previewAnswers[index] === optionIndex
                                    : publicAnswers[question.id]?.index === optionIndex;
                            return (
                                <button
                                    key={optionIndex}
                                    type="button"
                                    className={`offacto-brief-chip ${selected ? 'on' : ''}`}
                                    onClick={() =>
                                        mode === 'builder'
                                            ? setBuilderAnswer(index, optionIndex)
                                            : setPublicAnswer?.(question.id, {
                                                  index: optionIndex,
                                                  label: option.label,
                                              })
                                    }
                                >
                                    {option.label || t('briefings.choice_label')}
                                </button>
                            );
                        })}
                    </div>
                )}

                {question.type === 'multiple_choice' && (
                    <div className="offacto-brief-chips">
                        {(question.options || []).map((option, optionIndex) => {
                            const selected =
                                mode === 'builder'
                                    ? (previewAnswers[index] || []).includes(optionIndex)
                                    : (publicAnswers[question.id]?.indices || []).includes(optionIndex);
                            return (
                                <button
                                    key={optionIndex}
                                    type="button"
                                    className={`offacto-brief-chip ${selected ? 'on' : ''}`}
                                    onClick={() =>
                                        mode === 'builder'
                                            ? toggleBuilderMulti(index, optionIndex)
                                            : togglePublicMulti(question.id, optionIndex, question.options)
                                    }
                                >
                                    {option.label || t('briefings.choice_label')}
                                </button>
                            );
                        })}
                    </div>
                )}

                {question.type === 'quantity' && (
                    <input
                        className="offacto-brief-inp"
                        type="number"
                        min="0"
                        value={
                            mode === 'builder'
                                ? (previewAnswers[index] ?? '')
                                : (publicAnswers[question.id]?.quantity ?? '')
                        }
                        onChange={(e) =>
                            mode === 'builder'
                                ? setBuilderAnswer(index, e.target.value ? Number(e.target.value) : '')
                                : setPublicAnswer?.(question.id, { quantity: e.target.value })
                        }
                    />
                )}

                {question.type === 'yes_no' && (
                    <div className="offacto-brief-chips">
                        <button
                            type="button"
                            className={`offacto-brief-chip ${
                                (mode === 'builder'
                                    ? previewAnswers[index] === true
                                    : publicAnswers[question.id]?.yes === true)
                                    ? 'on'
                                    : ''
                            }`}
                            onClick={() =>
                                mode === 'builder'
                                    ? setBuilderAnswer(index, true)
                                    : setPublicAnswer?.(question.id, { yes: true })
                            }
                        >
                            {t('common.yes')}
                        </button>
                        <button
                            type="button"
                            className={`offacto-brief-chip ${
                                (mode === 'builder'
                                    ? previewAnswers[index] === false
                                    : publicAnswers[question.id]?.yes === false)
                                    ? 'on'
                                    : ''
                            }`}
                            onClick={() =>
                                mode === 'builder'
                                    ? setBuilderAnswer(index, false)
                                    : setPublicAnswer?.(question.id, { yes: false })
                            }
                        >
                            {t('common.no')}
                        </button>
                    </div>
                )}

                {question.type === 'file_upload' && (
                    mode === 'builder' ? (
                        <div className="offacto-brief-drop">
                            <Icon name="upload" />
                        </div>
                    ) : (
                        <label className="offacto-brief-drop offacto-brief-drop-interactive">
                            <Icon name="upload" />
                            {answerFiles[question.id] ? (
                                <span className="offacto-brief-meta">{answerFiles[question.id].name}</span>
                            ) : (
                                <span className="offacto-brief-meta">{t('briefings.upload_file')}</span>
                            )}
                            <input
                                type="file"
                                className="sr-only"
                                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                                onChange={(e) => setAnswerFile?.(question.id, e.target.files?.[0] || null)}
                            />
                        </label>
                    )
                )}

                {question.type === 'date' && (
                    <input
                        className="offacto-brief-inp"
                        type="date"
                        value={
                            mode === 'builder'
                                ? (previewAnswers[index] ?? '')
                                : (publicAnswers[question.id]?.date || '')
                        }
                        onChange={(e) =>
                            mode === 'builder'
                                ? setBuilderAnswer(index, e.target.value)
                                : setPublicAnswer?.(question.id, { date: e.target.value })
                        }
                    />
                )}

                {question.type === 'voice' && (
                    mode === 'builder' ? (
                        <div className="offacto-brief-phone-voice">
                            <Icon name="mic" />
                            <div className="offacto-brief-phone-wave" aria-hidden="true">
                                {Array.from({ length: 22 }, (_, key) => (
                                    <i key={key} style={{ height: `${8 + ((key * 7) % 22)}px` }} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <label className="offacto-brief-phone-voice offacto-brief-voice-interactive">
                            <Icon name="mic" />
                            <div className="offacto-brief-phone-wave" aria-hidden="true">
                                {Array.from({ length: 22 }, (_, key) => (
                                    <i key={key} style={{ height: `${8 + ((key * 7) % 22)}px` }} />
                                ))}
                            </div>
                            {answerFiles[question.id] ? (
                                <span className="offacto-brief-meta">{answerFiles[question.id].name}</span>
                            ) : null}
                            <input
                                type="file"
                                accept="audio/*"
                                className="sr-only"
                                onChange={(e) => setAnswerFile?.(question.id, e.target.files?.[0] || null)}
                            />
                        </label>
                    )
                )}

                {(question.type === 'short_text' || question.type === 'long_text') &&
                    (mode === 'builder' ? (
                        <textarea
                            className="offacto-brief-inp"
                            rows={question.type === 'long_text' ? 3 : 2}
                            readOnly
                            placeholder=""
                        />
                    ) : (
                        <textarea
                            className="offacto-brief-inp"
                            rows={question.type === 'long_text' ? 3 : 2}
                            value={publicAnswers[question.id]?.text || ''}
                            onChange={(e) => setPublicAnswer?.(question.id, { text: e.target.value })}
                        />
                    ))}

                {err ? <span className="offacto-brief-field-error">{err}</span> : null}
            </div>
        );
    });
}
