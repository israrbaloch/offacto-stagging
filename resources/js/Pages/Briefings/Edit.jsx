import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Icon from '../../Components/Icon';
import SelectMenu from '../../Components/SelectMenu';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { optionsFromMap } from '../../lib/utils';

const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-800';

function emptyQuestion(type = 'short_text') {
    return {
        id: null,
        type,
        label: '',
        help_text: '',
        required: false,
        service_id: '',
        price_override: '',
        options: type === 'single_choice' ? [{ label: '', price: '', service_id: '' }] : [],
    };
}

export default function Edit({ briefing, customers = {}, services = [], questionTypes = {}, shareUrl }) {
    const customerOptions = optionsFromMap(customers);
    const serviceOptions = (services || []).map((service) => ({
        value: String(service.id),
        label: `${service.name} (${service.price})`,
    }));
    const typeOptions = optionsFromMap(questionTypes);

    const form = useForm({
        title: briefing.title || '',
        intro: briefing.intro || '',
        customer_id: briefing.customer_id || '',
        auto_generate_offer: briefing.auto_generate_offer ?? true,
        valid_until_days: briefing.valid_until_days || 14,
        status: briefing.status || 'draft',
        questions: (briefing.questions || []).map((question) => ({
            id: question.id,
            type: question.type,
            label: question.label || '',
            help_text: question.help_text || '',
            required: !!question.required,
            service_id: question.service_id || '',
            price_override: question.price_override ?? '',
            options: question.options || [],
        })),
    });

    const [copied, setCopied] = useState(false);

    const updateQuestion = (index, key, value) => {
        form.setData(
            'questions',
            form.data.questions.map((question, i) => (i === index ? { ...question, [key]: value } : question)),
        );
    };

    const changeType = (index, type) => {
        form.setData(
            'questions',
            form.data.questions.map((question, i) =>
                i === index
                    ? {
                          ...question,
                          type,
                          options: type === 'single_choice' ? question.options?.length ? question.options : [{ label: '', price: '', service_id: '' }] : [],
                      }
                    : question,
            ),
        );
    };

    const addQuestion = (type) => {
        form.setData('questions', [...form.data.questions, emptyQuestion(type)]);
    };

    const removeQuestion = (index) => {
        form.setData(
            'questions',
            form.data.questions.filter((_, i) => i !== index),
        );
    };

    const move = (index, dir) => {
        const next = [...form.data.questions];
        const target = index + dir;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        form.setData('questions', next);
    };

    const save = (extra = {}) => {
        router.put(`/briefings/${briefing.id}`, { ...form.data, ...extra }, {
            preserveScroll: true,
            onSuccess: () => {
                if (extra.status) form.setData('status', extra.status);
            },
        });
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt('Copy this link', shareUrl);
        }
    };

    const priced = (type) => ['yes_no', 'single_choice', 'quantity'].includes(type);

    return (
        <AuthenticatedLayout title={form.data.title || 'Briefing'}>
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/briefings" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100" aria-label="Back">
                        <Icon name="back" className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Briefing builder</h1>
                        <p className="text-xs text-slate-400 capitalize">{form.data.status}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <a
                        href={shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                    >
                        Preview
                    </a>
                    <button type="button" onClick={copyLink} className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
                        {copied ? 'Copied' : 'Copy share link'}
                    </button>
                    {form.data.status !== 'active' && (
                        <button type="button" onClick={() => save({ status: 'active' })} className="rounded-full border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
                            Activate
                        </button>
                    )}
                    {form.data.status === 'active' && (
                        <button type="button" onClick={() => save({ status: 'closed' })} className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
                            Close
                        </button>
                    )}
                    <button type="button" disabled={form.processing} onClick={() => save()} className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                        Save
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <label className="block md:col-span-2">
                            <span className={labelClass}>Internal title</span>
                            <input className={fieldClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                        </label>
                        <label className="block">
                            <span className={labelClass}>Customer (optional)</span>
                            <SelectMenu
                                className={fieldClass}
                                value={form.data.customer_id}
                                onChange={(e) => form.setData('customer_id', e.target.value)}
                                options={customerOptions}
                                placeholder="Template — assign later"
                            />
                        </label>
                        <label className="block">
                            <span className={labelClass}>Quote valid for (days)</span>
                            <input className={fieldClass} type="number" min="1" value={form.data.valid_until_days} onChange={(e) => form.setData('valid_until_days', e.target.value)} />
                        </label>
                        <label className="block md:col-span-2">
                            <span className={labelClass}>Intro shown to the respondent</span>
                            <textarea className={fieldClass} rows={4} value={form.data.intro} onChange={(e) => form.setData('intro', e.target.value)} />
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={!!form.data.auto_generate_offer}
                                onChange={(e) => form.setData('auto_generate_offer', e.target.checked)}
                            />
                            Auto-create a draft quotation from answers
                        </label>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">Questions</h2>
                        <div className="flex flex-wrap gap-2">
                            {typeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => addQuestion(option.value)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    <Icon name="plus" className="h-3.5 w-3.5" />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {form.data.questions.length === 0 && <p className="text-sm text-slate-400">Add a heading or question to get started.</p>}
                        {form.data.questions.map((question, index) => (
                            <div key={question.id || `new-${index}`} className="rounded-2xl border border-slate-200 p-4">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Question {index + 1}</span>
                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => move(index, -1)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50" aria-label="Move up">
                                            <Icon name="chevron" className="h-4 w-4 rotate-180" />
                                        </button>
                                        <button type="button" onClick={() => move(index, 1)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50" aria-label="Move down">
                                            <Icon name="chevron" className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => removeQuestion(index)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove">
                                            <Icon name="trash" className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="block">
                                        <span className={labelClass}>Type</span>
                                        <SelectMenu className={fieldClass} value={question.type} onChange={(e) => changeType(index, e.target.value)} options={typeOptions} allowEmpty={false} />
                                    </label>
                                    <label className="block">
                                        <span className={labelClass}>Label</span>
                                        <input className={fieldClass} value={question.label} onChange={(e) => updateQuestion(index, 'label', e.target.value)} />
                                        {form.errors[`questions.${index}.label`] && (
                                            <span className="mt-1 block text-xs text-rose-600">{form.errors[`questions.${index}.label`]}</span>
                                        )}
                                    </label>
                                    {question.type !== 'heading' && (
                                        <>
                                            <label className="block md:col-span-2">
                                                <span className={labelClass}>Help text</span>
                                                <input className={fieldClass} value={question.help_text} onChange={(e) => updateQuestion(index, 'help_text', e.target.value)} />
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                                <input type="checkbox" checked={question.required} onChange={(e) => updateQuestion(index, 'required', e.target.checked)} />
                                                Required
                                            </label>
                                        </>
                                    )}
                                    {priced(question.type) && question.type !== 'single_choice' && (
                                        <>
                                            <label className="block">
                                                <span className={labelClass}>Linked service</span>
                                                <SelectMenu
                                                    className={fieldClass}
                                                    value={question.service_id}
                                                    onChange={(e) => updateQuestion(index, 'service_id', e.target.value)}
                                                    options={serviceOptions}
                                                    placeholder="None"
                                                />
                                            </label>
                                            <label className="block">
                                                <span className={labelClass}>Price override</span>
                                                <input className={fieldClass} type="number" min="0" step="0.01" value={question.price_override} onChange={(e) => updateQuestion(index, 'price_override', e.target.value)} />
                                            </label>
                                        </>
                                    )}
                                </div>
                                {question.type === 'single_choice' && (
                                    <div className="mt-4 space-y-3">
                                        <div className="text-sm font-medium text-slate-800">Choices</div>
                                        {(question.options || []).map((option, optionIndex) => (
                                            <div key={optionIndex} className="grid gap-3 md:grid-cols-3">
                                                <input
                                                    className={fieldClass}
                                                    placeholder="Label"
                                                    value={option.label}
                                                    onChange={(e) => {
                                                        const options = [...question.options];
                                                        options[optionIndex] = { ...options[optionIndex], label: e.target.value };
                                                        updateQuestion(index, 'options', options);
                                                    }}
                                                />
                                                <input
                                                    className={fieldClass}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Price"
                                                    value={option.price}
                                                    onChange={(e) => {
                                                        const options = [...question.options];
                                                        options[optionIndex] = { ...options[optionIndex], price: e.target.value };
                                                        updateQuestion(index, 'options', options);
                                                    }}
                                                />
                                                <SelectMenu
                                                    className={fieldClass}
                                                    value={option.service_id || ''}
                                                    onChange={(e) => {
                                                        const options = [...question.options];
                                                        options[optionIndex] = { ...options[optionIndex], service_id: e.target.value };
                                                        updateQuestion(index, 'options', options);
                                                    }}
                                                    options={serviceOptions}
                                                    placeholder="Service"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => updateQuestion(index, 'options', [...(question.options || []), { label: '', price: '', service_id: '' }])}
                                            className="text-sm font-medium text-indigo-600"
                                        >
                                            Add choice
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex justify-between">
                    <Link href={`/briefings/${briefing.id}/responses`} className="text-sm font-medium text-indigo-600">
                        View responses
                    </Link>
                    <button
                        type="button"
                        className="text-sm text-rose-600"
                        onClick={() => {
                            if (confirm('Delete this briefing?')) router.delete(`/briefings/${briefing.id}`);
                        }}
                    >
                        Delete briefing
                    </button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
