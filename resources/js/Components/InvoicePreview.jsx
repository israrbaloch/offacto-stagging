import SafeHtml from './SafeHtml';
import { money } from '../lib/utils';

function prettyDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB');
}

export default function InvoicePreview({
    number,
    date,
    dueDate,
    offerNumber,
    from = {},
    to = {},
    intro,
    desc,
    items = [],
    comments,
    copyrightLabel,
    vatRate = 21,
}) {
    const priced = items.filter((item) => item.kind !== 'text');
    const subtotal = priced.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
    const vat = subtotal * (Number(vatRate) / 100);
    const total = subtotal + vat;
    const fromLine = [from.street, from.house].filter(Boolean).join(' ');
    const fromCity = [from.postal_code, from.city].filter(Boolean).join(' ');

    return (
        <div className="bg-white px-8 py-10 text-slate-700 sm:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
                <div>
                    <div className="text-sm font-semibold text-slate-900">{from.name || 'Your company'}</div>
                    <div className="mt-1 text-sm text-slate-500">
                        {fromLine && <div>{fromLine}</div>}
                        {fromCity && <div>{fromCity}</div>}
                        {from.email && <div>{from.email}</div>}
                    </div>
                </div>
                <div className="text-left lg:text-right">
                    <div className="text-4xl font-semibold tracking-tight text-indigo-600">Invoice</div>
                    <div className="mt-3 text-sm text-slate-500">
                        <div>
                            Invoice No: <span className="font-semibold text-slate-900">{number || '—'}</span>
                        </div>
                        <div>Date: {prettyDate(date)}</div>
                        <div>Due date: {prettyDate(dueDate)}</div>
                        {offerNumber && <div>Offer ref: {offerNumber}</div>}
                    </div>
                </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-indigo-500">Bill to</div>
                    <div className="mt-1 font-semibold text-slate-900">{to.name || 'Client to be selected'}</div>
                    <div className="mt-1 text-slate-500">
                        {to.org && <div>{to.org}</div>}
                        <div>{to.address || '—'}</div>
                        {to.email && <div>{to.email}</div>}
                    </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-indigo-500">From</div>
                    <div className="mt-1 font-semibold text-slate-900">{from.name || 'Your company'}</div>
                    <div className="mt-1 text-slate-500">
                        {fromLine && <div>{fromLine}</div>}
                        {fromCity && <div>{fromCity}</div>}
                    </div>
                </div>
            </div>

            {intro && (
                <div className="mt-10">
                    <h3 className="text-lg font-semibold text-slate-900">Introduction</h3>
                    <SafeHtml value={intro} className="mt-2 text-sm leading-6 text-slate-600" />
                </div>
            )}

            {desc && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-900">Description</h3>
                    <SafeHtml value={desc} className="mt-2 text-sm leading-6 text-slate-600" />
                </div>
            )}

            <table className="mt-10 w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                        <th className="pb-2 font-medium">Description</th>
                        <th className="w-16 pb-2 text-right font-medium">Qty</th>
                        <th className="w-24 pb-2 text-right font-medium">Price</th>
                        <th className="w-20 pb-2 text-right font-medium">VAT</th>
                        <th className="w-24 pb-2 text-right font-medium">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-6 text-slate-400">
                                No invoice lines yet.
                            </td>
                        </tr>
                    )}
                    {items.map((item, index) => {
                        const line = Number(item.quantity || 0) * Number(item.price || 0);
                        return (
                            <tr key={index} className="border-b border-slate-100">
                                <td className="py-3 pr-4">
                                    <div className="font-semibold text-slate-900">{item.service_name || 'Line item'}</div>
                                    {item.description && <div className="mt-0.5 text-xs text-slate-400">{item.description}</div>}
                                </td>
                                <td className="py-3 text-right">{item.kind === 'text' ? '—' : item.quantity}</td>
                                <td className="py-3 text-right">{item.kind === 'text' ? '—' : money(item.price)}</td>
                                <td className="py-3 text-right">{item.kind === 'text' ? '—' : `${vatRate}%`}</td>
                                <td className="py-3 text-right">{item.kind === 'text' ? '—' : money(line)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="mt-8 md:ml-auto md:w-64 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">{money(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                    <span>VAT ({vatRate}%)</span>
                    <span className="font-semibold text-slate-900">{money(vat)}</span>
                </div>
                <div className="flex justify-between pt-1 text-lg font-semibold text-indigo-600">
                    <span>Total</span>
                    <span>{money(total)}</span>
                </div>
            </div>

            {copyrightLabel && (
                <div className="mt-8 rounded-xl bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-800">
                    <div className="font-semibold">Copyright — {copyrightLabel}</div>
                </div>
            )}

            {comments && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
                    <SafeHtml value={comments} className="mt-2 rounded-xl border-l-4 border-indigo-500 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600" />
                </div>
            )}
        </div>
    );
}
