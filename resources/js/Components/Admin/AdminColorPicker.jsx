import { AdminField, inputClass } from './ui';

function normalizeHex(value) {
    if (!value || typeof value !== 'string') return '#000000';
    const v = value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v;
    if (/^#[0-9A-Fa-f]{3}$/.test(v)) return v;
    return '#000000';
}

export default function AdminColorPicker({ label, hint, value, onChange }) {
    const hex = normalizeHex(value);

    return (
        <AdminField label={label} hint={hint}>
            <div className="flex flex-wrap items-center gap-3">
                <input
                    type="color"
                    className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm"
                    value={hex}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label={`${label} color picker`}
                />
                <span className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium tabular-nums text-slate-700">{hex.toUpperCase()}</span>
            </div>
        </AdminField>
    );
}
