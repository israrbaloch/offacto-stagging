const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan(f)', 'Feb(f)', 'Mar(f)'];
const revenue = [72, 78, 74, 86, 92, 98, 104, 110, 118, 126, 132, 140, 148, 156, 164];
const expenses = [48, 52, 50, 54, 58, 60, 62, 64, 68, 70, 72, 74, 76, 78, 80];

function toPoints(values, width, height, pad) {
    const min = 40;
    const max = 180;
    return values
        .map((value, index) => {
            const x = pad + (index * (width - pad * 2)) / (values.length - 1);
            const y = height - pad - ((value - min) / (max - min)) * (height - pad * 2);
            return `${x},${y}`;
        })
        .join(' ');
}

export function CashflowChart() {
    const width = 920;
    const height = 260;
    const pad = 36;
    const revenuePoints = toPoints(revenue, width, height, pad).split(' ');
    const expensePoints = toPoints(expenses, width, height, pad);
    const actualRevenue = revenuePoints.slice(0, 12).join(' ');
    const forecastRevenue = revenuePoints.slice(11).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
            {[40, 80, 120, 160].map((tick) => {
                const y = height - pad - ((tick - 40) / 140) * (height - pad * 2);
                return (
                    <g key={tick}>
                        <line x1={pad} x2={width - 12} y1={y} y2={y} className="stroke-slate-100" />
                        <text x={8} y={y + 4} className="fill-slate-400 text-[11px]">
                            ${tick}k
                        </text>
                    </g>
                );
            })}
            <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                strokeLinejoin="round"
                points={actualRevenue}
            />
            <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                strokeDasharray="7 6"
                strokeLinejoin="round"
                points={forecastRevenue}
            />
            <polyline
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinejoin="round"
                points={expensePoints}
            />
            {months.map((month, index) => {
                const x = pad + (index * (width - pad * 2)) / (months.length - 1);
                return (
                    <text key={month} x={x} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">
                        {month}
                    </text>
                );
            })}
        </svg>
    );
}

export function PaymentDonut() {
    const radius = 68;
    const circumference = 2 * Math.PI * radius;
    const segments = [
        { color: '#4f46e5', value: 0.65 },
        { color: '#cbd5e1', value: 0.25 },
        { color: '#fb7185', value: 0.1 },
    ];
    let offset = 0;

    return (
        <div className="relative mx-auto h-52 w-52">
            <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
                {segments.map((segment) => {
                    const length = circumference * segment.value;
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
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Total outstanding</div>
                <div className="mt-1 font-serif text-3xl font-semibold text-slate-900">$342k</div>
            </div>
        </div>
    );
}

export function DsoBars() {
    const rows = [
        { label: 'Enterprise', value: 42 },
        { label: 'Mid-Market', value: 31 },
        { label: 'SMB', value: 15 },
        { label: 'Startup', value: 24 },
    ];

    return (
        <div className="space-y-4">
            {rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[110px_1fr] items-center gap-3">
                    <div className="text-sm text-slate-500">{row.label}</div>
                    <div className="h-3 rounded-full bg-indigo-50">
                        <div
                            className="h-3 rounded-full bg-indigo-600"
                            style={{ width: `${(row.value / 50) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
            <div className="grid grid-cols-[110px_1fr] gap-3 text-xs text-slate-400">
                <span />
                <div className="flex justify-between">
                    {[0, 10, 20, 30, 40, 50].map((tick) => (
                        <span key={tick}>{tick}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
