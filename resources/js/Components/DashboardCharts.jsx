import { money } from '../lib/utils';

function scaleBounds(values) {
    const numeric = values.filter((value) => Number.isFinite(value));
    if (numeric.length === 0) {
        return { min: 0, max: 1 };
    }
    const max = Math.max(...numeric, 1);
    const min = 0;
    return { min, max: max * 1.1 };
}

function toPoints(values, width, height, pad, bounds) {
    const { min, max } = bounds;
    const span = max - min || 1;

    return values
        .map((value, index) => {
            const x = pad + (index * (width - pad * 2)) / Math.max(values.length - 1, 1);
            const y = height - pad - ((value - min) / span) * (height - pad * 2);
            return `${x},${y}`;
        })
        .join(' ');
}

function formatAxis(value) {
    if (value >= 1000) {
        return `${Math.round(value / 1000)}k`;
    }
    return String(Math.round(value));
}

export function CashflowChart({ data = {} }) {
    const labels = data.labels || [];
    const paid = data.paid || [];
    const outstanding = data.outstanding || [];
    const expenses = data.expenses || [];
    const width = 920;
    const height = 260;
    const pad = 36;
    const bounds = scaleBounds([...paid, ...outstanding, ...expenses]);
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => bounds.min + (bounds.max - bounds.min) * ratio);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
            {ticks.map((tick) => {
                const y = height - pad - ((tick - bounds.min) / (bounds.max - bounds.min || 1)) * (height - pad * 2);
                return (
                    <g key={tick}>
                        <line x1={pad} x2={width - 12} y1={y} y2={y} className="stroke-slate-100" />
                        <text x={8} y={y + 4} className="fill-slate-400 text-[11px]">
                            {formatAxis(tick)}
                        </text>
                    </g>
                );
            })}
            {paid.some((value) => value > 0) && (
                <polyline
                    fill="none"
                    stroke="#4054b2"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    points={toPoints(paid, width, height, pad, bounds)}
                />
            )}
            {outstanding.some((value) => value > 0) && (
                <polyline
                    fill="none"
                    stroke="#fb7185"
                    strokeWidth="2"
                    strokeDasharray="6 5"
                    strokeLinejoin="round"
                    points={toPoints(outstanding, width, height, pad, bounds)}
                />
            )}
            {expenses.some((value) => value > 0) && (
                <polyline
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    points={toPoints(expenses, width, height, pad, bounds)}
                />
            )}
            {labels.map((month, index) => {
                const x = pad + (index * (width - pad * 2)) / Math.max(labels.length - 1, 1);
                return (
                    <text key={`${month}-${index}`} x={x} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">
                        {month}
                    </text>
                );
            })}
        </svg>
    );
}

export function PaymentDonut({ paymentStatus = {}, totalOutstanding = 0 }) {
    const radius = 68;
    const circumference = 2 * Math.PI * radius;
    const segments = [
        { color: '#4054b2', value: paymentStatus.paid || 0 },
        { color: '#cbd5e1', value: paymentStatus.unpaid || 0 },
        { color: '#fbbf24', value: paymentStatus.partial || 0 },
        { color: '#fb7185', value: paymentStatus.overdue || 0 },
    ].filter((segment) => segment.value > 0);

    const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
    let offset = 0;

    return (
        <div className="relative mx-auto h-52 w-52">
            <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
                {segments.length === 0 ? (
                    <circle cx="90" cy="90" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="18" />
                ) : (
                    segments.map((segment) => {
                        const fraction = segment.value / total;
                        const length = circumference * fraction;
                        const dash = `${length} ${circumference - length}`;
                        const current = offset;
                        offset += length;
                        return (
                            <circle
                                key={segment.color}
                                cx="90"
                                cy="90"
                                r={radius}
                                fill="none"
                                stroke={segment.color}
                                strokeWidth="18"
                                strokeDasharray={dash}
                                strokeDashoffset={-current}
                                strokeLinecap="butt"
                            />
                        );
                    })
                )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Total outstanding</div>
                <div className="mt-1 font-serif text-3xl font-semibold text-slate-900">{money(totalOutstanding)}</div>
            </div>
        </div>
    );
}

export function DsoBars({ rows = [] }) {
    const maxDays = Math.max(...rows.map((row) => row.days || 0), 30);

    return (
        <div className="space-y-4">
            {rows.length === 0 && (
                <p className="text-sm text-slate-400">No paid invoices yet.</p>
            )}
            {rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[110px_1fr] items-center gap-3">
                    <div className="text-sm text-slate-500">{row.label}</div>
                    <div className="h-3 rounded-full bg-indigo-50">
                        <div
                            className="h-3 rounded-full bg-indigo-600"
                            style={{ width: `${((row.days || 0) / maxDays) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
            {rows.length > 0 && (
                <div className="grid grid-cols-[110px_1fr] gap-3 text-xs text-slate-400">
                    <span />
                    <div className="flex justify-between">
                        {[0, Math.round(maxDays * 0.25), Math.round(maxDays * 0.5), Math.round(maxDays * 0.75), maxDays].map((tick) => (
                            <span key={tick}>{tick}d</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
