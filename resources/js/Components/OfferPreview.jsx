import SafeHtml from './SafeHtml';
import { money } from '../lib/utils';

function prettyDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function OfferPreview({
    number,
    date,
    validUntil,
    from = {},
    to = {},
    scope,
    items = [],
    notes,
    vatRate = 21,
    sender = {},
    client = {},
    theme = {},
    logoUrl,
}) {
    const primary = theme.primary || '#4054b2';
    const secondary = theme.secondary || '#0f172a';
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
                    {logoUrl && <img src={logoUrl} alt="" className="mb-3 h-8 w-auto object-contain" />}
                    <div className="text-4xl font-semibold tracking-tight" style={{ color: primary }}>Quotation</div>
                    <div className="mt-3 text-sm text-slate-500">
                        <div className="font-semibold text-slate-900">#{number || '—'}</div>
                        <div>Date: {prettyDate(date)}</div>
                        <div>Valid until: {prettyDate(validUntil)}</div>
                    </div>
                </div>
                <div className="grid min-w-[280px] grid-cols-2 gap-8 text-sm">
                    <div>
                        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">From</div>
                        <div className="mt-1 font-semibold" style={{ color: secondary }}>{from.name || 'Your company'}</div>
                        <div className="mt-1 text-slate-500">
                            {fromLine && <div>{fromLine}</div>}
                            {fromCity && <div>{fromCity}</div>}
                            {from.email && <div>{from.email}</div>}
                        </div>
                    </div>
                    <div>
                        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">To</div>
                        <div className="mt-1 font-semibold text-slate-900">{to.name || 'Client to be selected'}</div>
                        <div className="mt-1 text-slate-500">
                            {to.attn && <div>Attn: {to.attn}</div>}
                            <div>{to.address || '—'}</div>
                            {to.email && <div>{to.email}</div>}
                        </div>
                    </div>
                </div>
            </div>

            {scope && (
                <div className="mt-10">
                    <h3 className="text-lg font-semibold" style={{ color: secondary }}>Project Scope</h3>
                    <SafeHtml value={scope} className="mt-2 text-sm leading-6 text-slate-600" />
                </div>
            )}

            <table className="mt-10 w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                        <th className="pb-2 font-medium">Description</th>
                        <th className="w-16 pb-2 text-right font-medium">Qty</th>
                        <th className="w-24 pb-2 text-right font-medium">Price</th>
                        <th className="w-24 pb-2 text-right font-medium">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 && (
                        <tr>
                            <td colSpan="4" className="py-6 text-slate-400">
                                No quotation lines yet.
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
                                <td className="py-3 text-right">{item.kind === 'text' ? '—' : money(line)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-xl px-4 py-3 text-sm leading-6" style={{ backgroundColor: '#f8fafc', color: secondary, borderLeft: `3px solid ${primary}` }}>
                    Payment is due according to the terms in this quotation. 50% may be requested upon approval, with the
                    remainder on delivery, unless otherwise agreed in writing.
                    {notes && <SafeHtml value={notes} className="mt-3 text-indigo-700" />}
                </div>
                <div className="md:justify-self-end md:w-64 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span className="font-semibold text-slate-900">{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>VAT ({vatRate}%)</span>
                        <span className="font-semibold text-slate-900">{money(vat)}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-lg font-semibold" style={{ color: primary }}>
                        <span>Total</span>
                        <span>{money(total)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">Authorization</div>
            <div className="mt-4 grid gap-8 sm:grid-cols-2">
                <div>
                    <div className="font-semibold text-slate-900">{sender.name || from.name}</div>
                    <div className="text-sm text-slate-400">{sender.title || 'Authorized representative'}</div>
                    <div className="text-sm text-slate-400">{prettyDate(date)}</div>
                </div>
                <div>
                    <div className="mb-2 border-b border-slate-300 pb-6 text-sm text-slate-400">Sign here...</div>
                    <div className="font-semibold text-slate-900">{client.name || 'Client'}</div>
                    <div className="text-sm text-slate-400">Authorized representative</div>
                    <div className="text-sm text-slate-400">Date</div>
                </div>
            </div>
        </div>
    );
}
