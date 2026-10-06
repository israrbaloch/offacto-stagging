import Logo from './Logo';
import SafeHtml from './SafeHtml';
import { DEFAULT_BRAND_PRIMARY, DEFAULT_BRAND_SECONDARY } from '../lib/brand';
import { formatQuantityDisplay, lineIsHourly, priceColumnLabel, quantityColumnLabel } from '../lib/serviceBilling';
import { money } from '../lib/utils';

function prettyDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function QuotationWave({ primary, secondary }) {
    return (
        <svg className="block h-[72px] w-full" viewBox="0 0 1200 100" preserveAspectRatio="none" aria-hidden>
            <path
                fill={primary}
                fillOpacity="0.12"
                d="M0,40 C200,80 400,0 600,35 C800,70 1000,20 1200,50 L1200,100 L0,100 Z"
            />
            <path
                fill={secondary}
                fillOpacity="0.18"
                d="M0,55 C250,95 450,25 650,60 C850,90 1050,35 1200,65 L1200,100 L0,100 Z"
            />
        </svg>
    );
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
    paymentTerms,
    vatRate = 21,
    totalsOverride,
    theme = {},
    logoUrl,
    middleContent = null,
}) {
    const primary = theme.primary || DEFAULT_BRAND_PRIMARY;
    const secondary = theme.secondary || DEFAULT_BRAND_SECONDARY;
    const headerBg = `${primary}14`;

    const priced = items.filter((item) => item.kind !== 'text');
    const qtyHeader = quantityColumnLabel(items, []);
    const priceHeader = priceColumnLabel(items, []).replace(' (excl. VAT)', '');
    const calcSubtotal = priced.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || item.unit_price || 0), 0);
    const subtotal = totalsOverride?.subtotal ?? calcSubtotal;
    const vat = totalsOverride?.tax ?? calcSubtotal * (Number(vatRate) / 100);
    const total = totalsOverride?.total ?? subtotal + vat;
    const effectiveVatRate = totalsOverride?.vatRate ?? vatRate;

    const fromLine = [from.street, from.house].filter(Boolean).join(' ');
    const fromCity = [from.postal_code, from.city].filter(Boolean).join(' ');

    const lineAmount = (item) => {
        if (item.kind === 'text') return null;
        if (item.total != null) return Number(item.total);
        return Number(item.quantity || 0) * Number(item.price ?? item.unit_price ?? 0);
    };

    return (
        <div className="overflow-hidden bg-white text-slate-700">
            <div className="px-8 py-10 sm:px-12 sm:py-12">
            <div className="flex items-start justify-between gap-6">
                <div className="min-h-[48px]">
                    {logoUrl ? (
                        <img src={logoUrl} alt="" className="h-10 w-auto max-w-[180px] object-contain" />
                    ) : (
                        <Logo className="h-10 w-auto max-w-[180px]" />
                    )}
                </div>
                <div className="text-right text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    No. {number || '—'}
                </div>
            </div>

            <h1 className="mt-8 text-4xl font-bold uppercase tracking-wide sm:text-5xl" style={{ color: secondary }}>
                Quotation
            </h1>
            <p className="mt-2 text-sm text-slate-600">Date: {prettyDate(date)}</p>
            {validUntil && <p className="text-sm text-slate-600">Valid until: {prettyDate(validUntil)}</p>}

            <div className="mt-10 grid gap-10 sm:grid-cols-2">
                <div>
                    <p className="text-sm font-bold text-slate-900">Billed to:</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">{to.name || 'Client to be selected'}</p>
                    <div className="mt-1 space-y-0.5 text-sm text-slate-600">
                        {to.attn && <p>Attn: {to.attn}</p>}
                        {to.address && <p className="whitespace-pre-line">{to.address}</p>}
                        {to.email && <p>{to.email}</p>}
                    </div>
                </div>
                <div className="sm:text-right">
                    <p className="text-sm font-bold text-slate-900">From:</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">{from.name || 'Your company'}</p>
                    <div className="mt-1 space-y-0.5 text-sm text-slate-600 sm:ml-auto sm:max-w-xs">
                        {fromLine && <p>{fromLine}</p>}
                        {fromCity && <p>{fromCity}</p>}
                        {from.email && <p>{from.email}</p>}
                    </div>
                </div>
            </div>

            {scope && (
                <div className="mt-10 text-sm leading-relaxed text-slate-600">
                    <SafeHtml value={scope} />
                </div>
            )}

            {middleContent}

            <div className="mt-10 overflow-hidden rounded-sm border border-slate-200">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ backgroundColor: headerBg }}>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: secondary }}>
                                Item
                            </th>
                            <th className="w-24 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: secondary }}>
                                {qtyHeader}
                            </th>
                            <th className="w-28 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: secondary }}>
                                {priceHeader}
                            </th>
                            <th className="w-28 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: secondary }}>
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                    No quotation lines yet.
                                </td>
                            </tr>
                        )}
                        {items.map((item, index) => {
                            const amount = lineAmount(item);
                            const label = item.service_name || item.description || 'Line item';
                            return (
                                <tr key={index} className="border-t border-slate-100">
                                    <td className="px-4 py-3 font-medium text-slate-800">
                                        {label}
                                        {item.service_name && item.description && item.description !== item.service_name && (
                                            <span className="mt-0.5 block text-xs font-normal text-slate-500">{item.description}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-700">
                                        {formatQuantityDisplay(item, [])}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-700">
                                        {item.kind === 'text'
                                            ? '—'
                                            : `${money(item.price ?? item.unit_price)}${lineIsHourly(item, []) ? '/h' : ''}`}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                                        {amount == null ? '—' : money(amount)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-slate-200">
                            <td colSpan={2} className="px-4 py-2" />
                            <td className="px-4 py-2 text-right text-xs text-slate-500">Subtotal</td>
                            <td className="px-4 py-2 text-right text-sm text-slate-700">{money(subtotal)}</td>
                        </tr>
                        <tr>
                            <td colSpan={2} />
                            <td className="px-4 py-2 text-right text-xs text-slate-500">VAT ({effectiveVatRate}%)</td>
                            <td className="px-4 py-2 text-right text-sm text-slate-700">{money(vat)}</td>
                        </tr>
                        <tr className="border-t border-slate-300">
                            <td colSpan={2} />
                            <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">Total</td>
                            <td className="px-4 py-3 text-right text-base font-bold" style={{ color: primary }}>
                                {money(total)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {(paymentTerms?.trim() || notes) && (
                <div className="mt-8 space-y-2 border-t border-slate-200 pt-6 text-sm text-slate-700">
                    {paymentTerms?.trim() && (
                        <p className="whitespace-pre-wrap">
                            <span className="font-bold" style={{ color: secondary }}>
                                Payment terms:{' '}
                            </span>
                            {paymentTerms.trim()}
                        </p>
                    )}
                    {notes && (
                        <div className={paymentTerms?.trim() ? 'mt-2' : ''}>
                            <span className="font-bold" style={{ color: secondary }}>
                                Note:{' '}
                            </span>
                            <SafeHtml value={notes} className="mt-1 inline-block text-slate-600" />
                        </div>
                    )}
                </div>
            )}
            </div>
            <QuotationWave primary={primary} secondary={secondary} />
        </div>
    );
}
