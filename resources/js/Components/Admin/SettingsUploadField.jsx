import { useId } from 'react';
import { AdminField } from './ui';

export default function SettingsUploadField({ label, hint, previewUrl, accept = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml', onSelect, fileName }) {
    const id = useId();

    return (
        <AdminField label={label} hint={hint || 'PNG, JPG, WebP or SVG. Max 2 MB.'} className="sm:col-span-2">
            {previewUrl && (
                <div className="mb-3 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                    <img src={previewUrl} alt="" className="max-h-16 max-w-[200px] object-contain" />
                    <span className="text-xs text-slate-500">Current file</span>
                </div>
            )}
            <label
                htmlFor={id}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-slate-400 hover:bg-slate-50/50"
            >
                <span className="text-sm font-medium text-slate-800">{fileName ? fileName : 'Choose a file'}</span>
                <span className="mt-1 text-xs text-slate-500">Click to browse</span>
            </label>
            <input
                id={id}
                type="file"
                className="sr-only"
                accept={accept}
                onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    onSelect(file);
                }}
            />
        </AdminField>
    );
}
