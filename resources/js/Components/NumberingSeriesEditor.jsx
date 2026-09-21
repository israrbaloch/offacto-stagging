import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Icon from './Icon';
import SelectMenu from './SelectMenu';
import { t } from '../lib/i18n';

const fieldClass =
    'w-full rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100';
const labelClass = 'mb-1.5 block text-xs font-medium text-slate-600';

function periodToken(yearMonth) {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const shortYear = year.slice(-2);

    switch (yearMonth) {
        case 'year_short':
            return shortYear;
        case 'year_month':
            return `${year}${month}`;
        case 'year_short_month':
            return `${shortYear}${month}`;
        case 'year':
        default:
            return year;
    }
}

export function previewNumber(series) {
    const prefix = series.prefix ?? '';
    const period = series.year_month ? periodToken(series.year_month) : '';
    const separator = series.separator ?? '-';
    const digits = Number(series.digits || 4);
    const counter = Math.max(1, Number(series.next_number || 1));
    const number = String(counter).padStart(digits, '0');
    let formatted = `${prefix}${period}${separator}${number}`;
    if (series.use_suffix && series.suffix) {
        formatted += series.suffix;
    }
    return formatted;
}

const emptySeries = {
    name: '',
    type: 'invoices',
    prefix: '',
    year_month: 'year',
    separator: '-',
    digits: '4',
    next_number: '1',
    use_suffix: false,
    suffix: '',
    restart_count: 'annual',
};

function SeriesForm({ series, onCancel, onSaved }) {
    const isNew = !series?.id;
    const form = useForm({ ...emptySeries, ...series });

    const preview = useMemo(() => previewNumber(form.data), [form.data]);

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onSaved?.(),
        };
        if (isNew) {
            form.post('/profile/numbering-series', options);
        } else {
            form.patch(`/profile/numbering-series/${series.id}`, options);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 border-t border-slate-100 bg-slate-50/80 px-4 py-4">
            <p className="text-sm text-slate-700">
                {t('numbering.next_preview')}{' '}
                <span className="font-semibold text-slate-900">{preview}</span>
            </p>

            {isNew && (
                <label className="block">
                    <span className={labelClass}>{t('numbering.name')}</span>
                    <input
                        className={fieldClass}
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        required
                    />
                    {form.errors.name && <span className="mt-1 block text-xs text-rose-600">{form.errors.name}</span>}
                </label>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block">
                    <span className={labelClass}>{t('numbering.prefix')}</span>
                    <input
                        className={fieldClass}
                        value={form.data.prefix}
                        onChange={(e) => form.setData('prefix', e.target.value)}
                    />
                </label>
                <label className="block">
                    <span className={labelClass}>{t('numbering.year_month')}</span>
                    <SelectMenu
                        className={fieldClass}
                        value={form.data.year_month}
                        onChange={(e) => form.setData('year_month', e.target.value)}
                        allowEmpty={false}
                        options={[
                            { value: 'year', label: t('numbering.year_full') },
                            { value: 'year_short', label: t('numbering.year_short') },
                            { value: 'year_month', label: t('numbering.year_month_option') },
                            { value: 'year_short_month', label: t('numbering.year_short_month') },
                        ]}
                    />
                </label>
                <label className="block">
                    <span className={labelClass}>{t('numbering.separator')}</span>
                    <SelectMenu
                        className={fieldClass}
                        value={form.data.separator}
                        onChange={(e) => form.setData('separator', e.target.value)}
                        allowEmpty={false}
                        options={[
                            { value: '_', label: '_' },
                            { value: '-', label: '-' },
                            { value: '/', label: '/' },
                            { value: '.', label: '.' },
                        ]}
                    />
                </label>
                <label className="block">
                    <span className={labelClass}>{t('numbering.digits')}</span>
                    <SelectMenu
                        className={fieldClass}
                        value={form.data.digits}
                        onChange={(e) => form.setData('digits', e.target.value)}
                        allowEmpty={false}
                        options={['2', '3', '4', '5', '6'].map((value) => ({
                            value,
                            label: t('numbering.digits_count', { count: value }),
                        }))}
                    />
                </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                    <span className={labelClass}>{t('numbering.type')}</span>
                    <SelectMenu
                        className={fieldClass}
                        value={form.data.type}
                        onChange={(e) => form.setData('type', e.target.value)}
                        allowEmpty={false}
                        options={[
                            { value: 'invoices', label: t('numbering.type_invoices') },
                            { value: 'credit_notes', label: t('numbering.type_credit_notes') },
                            { value: 'both', label: t('numbering.type_both') },
                        ]}
                    />
                </label>
                <label className="flex items-end gap-2 pb-2.5 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={!!form.data.use_suffix}
                        onChange={(e) => form.setData('use_suffix', e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    {t('numbering.use_suffix')}
                </label>
            </div>

            {form.data.use_suffix && (
                <label className="block">
                    <span className={labelClass}>{t('numbering.suffix')}</span>
                    <input
                        className={fieldClass}
                        value={form.data.suffix}
                        onChange={(e) => form.setData('suffix', e.target.value)}
                    />
                </label>
            )}

            <div>
                <p className="text-sm font-medium text-slate-800">{t('numbering.restart_title')}</p>
                <p className="mt-0.5 text-xs text-slate-500">{t('numbering.restart_hint')}</p>
                <SelectMenu
                    className={`${fieldClass} mt-2 max-w-xs`}
                    value={form.data.restart_count}
                    onChange={(e) => form.setData('restart_count', e.target.value)}
                    allowEmpty={false}
                    options={[
                        { value: 'never', label: t('numbering.restart_never') },
                        { value: 'annual', label: t('numbering.restart_annual') },
                        { value: 'monthly', label: t('numbering.restart_monthly') },
                    ]}
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                    {t('common.save')}
                </button>
            </div>
        </form>
    );
}

export default function NumberingSeriesEditor({ series = [], activeSeriesId = null, company }) {
    const [expandedId, setExpandedId] = useState(null);
    const [creating, setCreating] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);

    if (!company) {
        return <p className="text-sm text-slate-500">{t('profile.no_company')}</p>;
    }

    const typeLabel = {
        invoices: t('numbering.type_invoices'),
        credit_notes: t('numbering.type_credit_notes'),
        both: t('numbering.type_both'),
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-600">{t('numbering.description')}</p>

            <div className="overflow-visible rounded-2xl border border-slate-200">
                <div className="hidden grid-cols-[1.4fr_1fr_1.2fr_auto] gap-3 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
                    <span>{t('numbering.name')}</span>
                    <span>{t('numbering.type')}</span>
                    <span>{t('numbering.next_issue')}</span>
                    <span className="w-8" />
                </div>

                {series.map((item) => (
                    <div key={item.id} className="border-t border-slate-100 first:border-t-0">
                        <div className="grid gap-2 px-4 py-3 sm:grid-cols-[1.4fr_1fr_1.2fr_auto] sm:items-center">
                            <div>
                                <div className="font-medium text-slate-900">{item.name}</div>
                                {Number(activeSeriesId) === Number(item.id) && (
                                    <span className="mt-0.5 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                                        {t('numbering.active')}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-slate-600 sm:text-base">{typeLabel[item.type] || item.type}</div>
                            <div className="font-mono text-sm text-slate-800">{item.preview}</div>
                            <div className="relative flex justify-end">
                                <button
                                    type="button"
                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                    onClick={() => {
                                        setMenuOpenId(menuOpenId === item.id ? null : item.id);
                                        setCreating(false);
                                    }}
                                    aria-label={t('common.actions')}
                                >
                                    <Icon name="dots-vertical" className="h-4 w-4" />
                                </button>
                                {menuOpenId === item.id && (
                                    <div className="absolute right-0 top-10 z-10 min-w-[10rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                                        <button
                                            type="button"
                                            className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                                            onClick={() => {
                                                setExpandedId(item.id);
                                                setMenuOpenId(null);
                                                setCreating(false);
                                            }}
                                        >
                                            {t('common.edit')}
                                        </button>
                                        {Number(activeSeriesId) !== Number(item.id) && (
                                            <button
                                                type="button"
                                                className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                                                onClick={() => {
                                                    router.post(`/profile/numbering-series/${item.id}/default`, {}, { preserveScroll: true });
                                                    setMenuOpenId(null);
                                                }}
                                            >
                                                {t('numbering.set_default')}
                                            </button>
                                        )}
                                        {series.length > 1 && (
                                            <button
                                                type="button"
                                                className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                                                onClick={() => {
                                                    if (window.confirm(t('numbering.delete_confirm'))) {
                                                        router.delete(`/profile/numbering-series/${item.id}`, { preserveScroll: true });
                                                    }
                                                    setMenuOpenId(null);
                                                }}
                                            >
                                                {t('common.delete')}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {expandedId === item.id && (
                            <SeriesForm
                                series={item}
                                onCancel={() => setExpandedId(null)}
                                onSaved={() => setExpandedId(null)}
                            />
                        )}
                    </div>
                ))}

                {series.length === 0 && !creating && (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">{t('numbering.empty')}</div>
                )}

                {creating && (
                    <div className="border-t border-slate-100">
                        <SeriesForm
                            series={{ ...emptySeries, name: t('numbering.new_default_name') }}
                            onCancel={() => setCreating(false)}
                            onSaved={() => setCreating(false)}
                        />
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={() => {
                    setCreating(true);
                    setExpandedId(null);
                    setMenuOpenId(null);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
                <Icon name="plus" className="h-4 w-4" />
                {t('numbering.new_series')}
            </button>
        </div>
    );
}
