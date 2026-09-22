import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import Logo from '../../Components/Logo';
import { t } from '../../lib/i18n';

function isAnswered(question, answers, answerFiles) {
    const value = answers[question.id];
    const file = answerFiles[question.id];

    if (question.type === 'file_upload') {
        return !!file;
    }
    if (!value) return false;
    if (typeof value === 'object') {
        if (question.type === 'yes_no') {
            return value.yes === true || value.yes === false;
        }
        if (question.type === 'multiple_choice') {
            return Array.isArray(value.indices) && value.indices.length > 0;
        }
        return value.text || value.label || value.quantity !== undefined && value.quantity !== '';
    }
    return true;
}

export default function Public({ briefing, token, submitted = false, canSubmit = false }) {
    const flash = usePage().props.flash;
    const done = submitted || flash?.status === 'briefing-submitted';
    const primary = briefing.company?.theme?.primary || '#4054b2';
    const askable = (briefing.questions || []).filter((question) => question.type !== 'heading');
    const form = useForm({
        respondent_name: '',
        respondent_email: '',
        answers: {},
        answer_files: {},
    });

    useEffect(() => {
        document.documentElement.style.setProperty('--company-primary', primary);
    }, [primary]);

    const setAnswer = (id, value) => {
        form.setData('answers', { ...form.data.answers, [id]: value });
    };

    const setFile = (id, file) => {
        form.setData('answer_files', { ...form.data.answer_files, [id]: file });
    };

    const toggleMultipleChoice = (questionId, index, label, options) => {
        const current = form.data.answers[questionId]?.indices || [];
        const next = current.includes(index)
            ? current.filter((item) => item !== index)
            : [...current, index];
        const labels = next.map((item) => options[item]?.label).filter(Boolean);
        setAnswer(questionId, { indices: next, labels });
    };

    const answeredCount = askable.filter((question) =>
        isAnswered(question, form.data.answers, form.data.answer_files),
    ).length;

    const progress = askable.length ? Math.round((answeredCount / askable.length) * 100) : 0;

    const submit = (e) => {
        e.preventDefault();
        form.post(`/b/${token}`, { forceFormData: true });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={briefing.title || 'Briefing'} />
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
                    {briefing.company?.logo_url ? (
                        <img src={briefing.company.logo_url} alt="" className="h-9 w-auto" />
                    ) : (
                        <Logo className="h-8 w-auto" />
                    )}
                    <div>
                        <div className="text-sm font-semibold text-slate-900">{briefing.company?.name}</div>
                        <div className="text-xs text-slate-400">{briefing.title}</div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-8">
                {done ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                        <h1 className="text-2xl font-semibold text-slate-900">{t('briefings.thank_you')}</h1>
                        <p className="mt-2 text-sm text-slate-500">{t('briefings.thank_you_body')}</p>
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <h1 className="text-2xl font-semibold text-slate-900">{briefing.title}</h1>
                            {briefing.intro && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{briefing.intro}</p>}
                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: primary }} />
                            </div>
                            {!canSubmit && <p className="mt-3 text-xs text-amber-600">{t('briefings.preview_only')}</p>}
                        </div>

                        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('briefings.your_name')}</span>
                                <input className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" value={form.data.respondent_name} onChange={(e) => form.setData('respondent_name', e.target.value)} required />
                                {form.errors.respondent_name && <span className="mt-1 block text-xs text-rose-600">{form.errors.respondent_name}</span>}
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('briefings.your_email')}</span>
                                <input type="email" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" value={form.data.respondent_email} onChange={(e) => form.setData('respondent_email', e.target.value)} required />
                                {form.errors.respondent_email && <span className="mt-1 block text-xs text-rose-600">{form.errors.respondent_email}</span>}
                            </label>
                        </div>

                        {(briefing.questions || []).map((question) => (
                            <div key={question.id} className="rounded-3xl border border-slate-200 bg-white p-6">
                                {question.type === 'heading' ? (
                                    <h2 className="text-lg font-semibold text-slate-900">{question.label}</h2>
                                ) : (
                                    <>
                                        <div className="text-sm font-medium text-slate-900">
                                            {question.label}
                                            {question.required && <span className="text-rose-500"> *</span>}
                                        </div>
                                        {question.help_text && <p className="mt-1 text-xs text-slate-400">{question.help_text}</p>}
                                        <div className="mt-3">
                                            {question.type === 'short_text' && (
                                                <input className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" value={form.data.answers[question.id]?.text || ''} onChange={(e) => setAnswer(question.id, { text: e.target.value })} />
                                            )}
                                            {question.type === 'long_text' && (
                                                <textarea className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" rows={4} value={form.data.answers[question.id]?.text || ''} onChange={(e) => setAnswer(question.id, { text: e.target.value })} />
                                            )}
                                            {question.type === 'yes_no' && (
                                                <div className="flex gap-2">
                                                    {[true, false].map((yes) => (
                                                        <button
                                                            key={String(yes)}
                                                            type="button"
                                                            onClick={() => setAnswer(question.id, { yes })}
                                                            className={`rounded-full px-4 py-2 text-sm font-medium ${
                                                                form.data.answers[question.id]?.yes === yes
                                                                    ? 'text-white'
                                                                    : 'border border-slate-200 bg-white text-slate-700'
                                                            }`}
                                                            style={form.data.answers[question.id]?.yes === yes ? { background: primary } : undefined}
                                                        >
                                                            {yes ? t('common.yes') : t('common.no')}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {question.type === 'single_choice' && (
                                                <div className="space-y-2">
                                                    {(question.options || []).map((option, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => setAnswer(question.id, { index, label: option.label })}
                                                            className={`block w-full rounded-xl border px-4 py-2.5 text-left text-sm ${
                                                                form.data.answers[question.id]?.index === index
                                                                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                                                    : 'border-slate-200 bg-white text-slate-700'
                                                            }`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {question.type === 'multiple_choice' && (
                                                <div className="space-y-2">
                                                    {(question.options || []).map((option, index) => {
                                                        const selected = (form.data.answers[question.id]?.indices || []).includes(index);
                                                        return (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => toggleMultipleChoice(question.id, index, option.label, question.options)}
                                                                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm ${
                                                                    selected
                                                                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                                                        : 'border-slate-200 bg-white text-slate-700'
                                                                }`}
                                                            >
                                                                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                                                                    {selected && '✓'}
                                                                </span>
                                                                {option.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {question.type === 'quantity' && (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                                                    value={form.data.answers[question.id]?.quantity ?? ''}
                                                    onChange={(e) => setAnswer(question.id, { quantity: e.target.value })}
                                                />
                                            )}
                                            {question.type === 'file_upload' && (
                                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-indigo-300 hover:bg-indigo-50/40">
                                                    <span className="text-sm font-medium text-slate-700">{t('briefings.upload_file')}</span>
                                                    <span className="mt-1 text-xs text-slate-400">{t('briefings.upload_hint')}</span>
                                                    {form.data.answer_files[question.id] && (
                                                        <span className="mt-2 text-xs font-medium text-indigo-700">{form.data.answer_files[question.id].name}</span>
                                                    )}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) setFile(question.id, file);
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        {form.errors[`answers.${question.id}`] && (
                                            <span className="mt-2 block text-xs text-rose-600">{form.errors[`answers.${question.id}`]}</span>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}

                        <div className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
                            <button
                                type="submit"
                                disabled={!canSubmit || form.processing}
                                className="w-full rounded-full bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                                {form.processing ? t('briefings.submitting') : t('briefings.submit')}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
