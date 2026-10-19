import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminColorPicker from './AdminColorPicker';
import SettingsStructuredField from './SettingsStructuredField';
import SettingsUploadField from './SettingsUploadField';
import { labelForSelectOption, normalizeSelectOptions } from '../../lib/adminSettingOptions';
import {
    AdminButton,
    AdminCard,
    AdminCheckboxField,
    AdminField,
    AdminFormActions,
    AdminFormGrid,
    checkboxClass,
    inputClass,
    selectClass,
} from './ui';

function serializeInitial(values, fields) {
    const out = {};
    fields.forEach((field) => {
        if (field.type === 'upload') {
            return;
        }
        if (field.type === 'structured' || field.type === 'json') {
            out[field.key] = values[field.key] ?? field.default ?? {};
        } else {
            out[field.key] = values[field.key] ?? field.default ?? '';
        }
    });
    return out;
}

export default function SettingsForm({
    sectionId,
    sectionTitle = '',
    sectionDescription = '',
    fields = [],
    values = {},
    locales = ['en', 'fr', 'nl'],
    settingsBasePath = '/admin/settings',
    StructuredFieldComponent = SettingsStructuredField,
}) {
    const initial = useMemo(() => serializeInitial(values, fields), [values, fields]);
    const form = useForm(initial);
    const [confirmReset, setConfirmReset] = useState(false);
    const [uploadNames, setUploadNames] = useState({});

    const submit = (e) => {
        e.preventDefault();
        const hasFiles = fields.some((f) => f.type === 'upload' && form.data[f.key] instanceof File);
        form.patch(`${settingsBasePath}/${sectionId}`, {
            preserveScroll: true,
            forceFormData: hasFiles,
        });
    };

    const reset = () => {
        router.post(
            `${settingsBasePath}/${sectionId}/reset`,
            { confirm: true },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmReset(false),
            },
        );
    };

    const simpleFields = fields.filter((f) => f.type !== 'structured');
    const structuredFields = fields.filter((f) => f.type === 'structured');
    const configTitle = sectionTitle || 'Settings';
    const configDescription =
        sectionDescription || 'These options apply across the whole platform. Save when you are finished reviewing.';

    return (
        <form onSubmit={submit} className="space-y-6">
            {(simpleFields.length > 0 || structuredFields.length > 0) && (
                <AdminCard title={configTitle} description={configDescription}>
                    {simpleFields.length > 0 && (
                        <AdminFormGrid cols={2} className={structuredFields.length ? 'mb-8' : ''}>
                            {simpleFields.map((field) => {
                                const key = field.key;
                                if (field.type === 'upload') {
                                    const accept =
                                        field.accept === 'favicon'
                                            ? 'image/png,image/jpeg,image/x-icon,image/vnd.microsoft.icon,.ico'
                                            : 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml';
                                    return (
                                        <SettingsUploadField
                                            key={key}
                                            label={field.label}
                                            hint={field.hint}
                                            accept={accept}
                                            previewUrl={values[`${key}_preview_url`]}
                                            fileName={uploadNames[key]}
                                            onSelect={(file) => {
                                                form.setData(key, file);
                                                setUploadNames((prev) => ({ ...prev, [key]: file?.name || '' }));
                                            }}
                                        />
                                    );
                                }
                                if (field.type === 'color') {
                                    return (
                                        <AdminColorPicker
                                            key={key}
                                            label={field.label}
                                            hint={field.hint}
                                            value={form.data[key]}
                                            onChange={(v) => form.setData(key, v)}
                                        />
                                    );
                                }
                                if (field.type === 'boolean') {
                                    return (
                                        <div key={key} className="sm:col-span-2">
                                            <AdminCheckboxField
                                                label={field.label}
                                                hint={field.hint}
                                                checked={!!form.data[key]}
                                                onChange={(e) => form.setData(key, e.target.checked)}
                                            />
                                        </div>
                                    );
                                }
                                if (field.type === 'select') {
                                    const selectOptions = normalizeSelectOptions(field.options || []).map((opt) => ({
                                        ...opt,
                                        label: labelForSelectOption(key, opt.value) !== opt.value ? labelForSelectOption(key, opt.value) : opt.label,
                                    }));
                                    return (
                                        <AdminField key={key} label={field.label} hint={field.hint}>
                                            <select className={selectClass} value={form.data[key] ?? ''} onChange={(e) => form.setData(key, e.target.value)}>
                                                {selectOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </AdminField>
                                    );
                                }
                                if (field.type === 'textarea') {
                                    return (
                                        <AdminField key={key} label={field.label} hint={field.hint} className="sm:col-span-2">
                                            <textarea className={`${inputClass} min-h-[100px]`} value={form.data[key] ?? ''} onChange={(e) => form.setData(key, e.target.value)} />
                                        </AdminField>
                                    );
                                }
                                if (field.type === 'password') {
                                    const setHint = values[`${key}_set`] ? 'A value is stored. Leave blank to keep unchanged.' : field.hint;
                                    return (
                                        <AdminField key={key} label={field.label} hint={setHint}>
                                            <input
                                                type="password"
                                                className={inputClass}
                                                value={form.data[key] ?? ''}
                                                onChange={(e) => form.setData(key, e.target.value)}
                                                autoComplete="new-password"
                                            />
                                        </AdminField>
                                    );
                                }
                                return (
                                    <AdminField key={key} label={field.label} hint={field.hint}>
                                        <input
                                            type={field.type === 'integer' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                                            className={inputClass}
                                            min={field.min}
                                            max={field.max}
                                            step={field.type === 'integer' ? 1 : undefined}
                                            value={form.data[key] ?? ''}
                                            onChange={(e) =>
                                                form.setData(key, field.type === 'integer' ? Number(e.target.value) : e.target.value)
                                            }
                                        />
                                    </AdminField>
                                );
                            })}
                        </AdminFormGrid>
                    )}

                    <div className="space-y-8">
                        {structuredFields.map((field) => (
                            <StructuredFieldComponent
                                key={field.key}
                                widget={field.widget}
                                field={field}
                                value={form.data[field.key]}
                                onChange={(v) => form.setData(field.key, v)}
                                locales={locales}
                            />
                        ))}
                    </div>

                    <AdminFormActions className="mt-8">
                        <AdminButton type="submit" disabled={form.processing}>
                            Save changes
                        </AdminButton>
                    </AdminFormActions>
                </AdminCard>
            )}

            <AdminCard title="Restore defaults" description="Reset only this page to its original values. Other admin areas stay unchanged.">
                <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" className={checkboxClass} checked={confirmReset} onChange={(e) => setConfirmReset(e.target.checked)} />
                    <span>I understand this will overwrite settings in this section.</span>
                </label>
                <AdminFormActions className="mt-4 border-0 pt-0 justify-start">
                    <AdminButton type="button" variant="danger" disabled={!confirmReset || form.processing} onClick={reset}>
                        Reset section
                    </AdminButton>
                </AdminFormActions>
            </AdminCard>
        </form>
    );
}
