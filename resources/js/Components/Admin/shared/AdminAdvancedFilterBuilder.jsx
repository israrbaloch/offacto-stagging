import { AdminButton, AdminField, AdminTextButton, inputClass, selectClass } from '../ui';

const OPERATORS = ['is', 'is_not', 'contains', 'before', 'after'];

/** SH-010 — composable filter rows. */
export default function AdminAdvancedFilterBuilder({ fields = [], value = [], onChange, onApply }) {
    const rows = value.length ? value : [{ field: fields[0]?.key || '', operator: 'is', value: '' }];

    const patch = (next) => onChange?.(next);

    return (
        <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white p-4">
            {rows.map((row, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <select
                        className={selectClass}
                        value={row.field}
                        onChange={(e) => {
                            const next = [...rows];
                            next[i] = { ...next[i], field: e.target.value };
                            patch(next);
                        }}
                    >
                        {fields.map((f) => (
                            <option key={f.key} value={f.key}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                    <select
                        className={selectClass}
                        value={row.operator}
                        onChange={(e) => {
                            const next = [...rows];
                            next[i] = { ...next[i], operator: e.target.value };
                            patch(next);
                        }}
                    >
                        {OPERATORS.map((op) => (
                            <option key={op} value={op}>
                                {op.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                    <input
                        className={inputClass}
                        value={row.value}
                        onChange={(e) => {
                            const next = [...rows];
                            next[i] = { ...next[i], value: e.target.value };
                            patch(next);
                        }}
                        placeholder="Value"
                    />
                    <AdminTextButton type="button" onClick={() => patch(rows.filter((_, j) => j !== i))}>
                        Remove
                    </AdminTextButton>
                </div>
            ))}
            <div className="flex flex-wrap gap-2">
                <AdminButton type="button" variant="secondary" onClick={() => patch([...rows, { field: fields[0]?.key || '', operator: 'is', value: '' }])}>
                    Add filter
                </AdminButton>
                <AdminButton type="button" onClick={() => onApply?.(rows)}>
                    Apply filters
                </AdminButton>
            </div>
        </div>
    );
}
