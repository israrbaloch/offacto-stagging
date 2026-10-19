import { AdminButton, AdminField, inputClass, selectClass } from '../ui';

/** SH-018 — date range, comparison, grouping for reports. */
export default function AdminChartReportFilters({ value = {}, onChange, onExport, groupOptions = [] }) {
    const v = { range: '30d', compare: 'none', group: groupOptions[0]?.value || '', ...value };

    const set = (key, val) => onChange?.({ ...v, [key]: val });

    return (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/70 bg-white p-4">
            <AdminField label="Range">
                <select className={selectClass} value={v.range} onChange={(e) => set('range', e.target.value)}>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="custom">Custom</option>
                </select>
            </AdminField>
            {v.range === 'custom' && (
                <>
                    <AdminField label="From">
                        <input type="date" className={inputClass} value={v.from || ''} onChange={(e) => set('from', e.target.value)} />
                    </AdminField>
                    <AdminField label="To">
                        <input type="date" className={inputClass} value={v.to || ''} onChange={(e) => set('to', e.target.value)} />
                    </AdminField>
                </>
            )}
            <AdminField label="Compare">
                <select className={selectClass} value={v.compare} onChange={(e) => set('compare', e.target.value)}>
                    <option value="none">No comparison</option>
                    <option value="previous_period">Previous period</option>
                    <option value="year_ago">Same period last year</option>
                </select>
            </AdminField>
            {groupOptions.length > 0 && (
                <AdminField label="Group by">
                    <select className={selectClass} value={v.group} onChange={(e) => set('group', e.target.value)}>
                        {groupOptions.map((g) => (
                            <option key={g.value} value={g.value}>
                                {g.label}
                            </option>
                        ))}
                    </select>
                </AdminField>
            )}
            {onExport && (
                <AdminButton type="button" variant="secondary" onClick={() => onExport(v)}>
                    Export report
                </AdminButton>
            )}
        </div>
    );
}
