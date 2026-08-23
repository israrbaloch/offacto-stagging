import Button from './Button';
import { money } from '../lib/utils';

export default function LineItemsEditor({ items, setItems, services = [], vatRate = 21, error }) {
    const addItem = (service) => {
        setItems([
            ...items,
            {
                service_id: service.id,
                service_name: service.name,
                description: service.description || '',
                quantity: 1,
                price: Number(service.price || 0),
            },
        ]);
    };

    const update = (index, key, value) => {
        setItems(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
    };

    const remove = (index) => setItems(items.filter((_, i) => i !== index));

    const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
    const vat = subtotal * (Number(vatRate) / 100);
    const total = subtotal + vat;

    return (
        <div>
            <div className="mb-3 flex flex-wrap gap-2">
                {services.map((service) => (
                    <button
                        key={service.id}
                        type="button"
                        onClick={() => addItem(service)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 hover:border-[var(--company-primary)]"
                    >
                        + {service.name}
                    </button>
                ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-3 py-2">Service</th>
                            <th className="px-3 py-2">Description</th>
                            <th className="px-3 py-2 w-24">Qty</th>
                            <th className="px-3 py-2 w-28">Price</th>
                            <th className="px-3 py-2 w-28">Total</th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                                    Add at least one service line.
                                </td>
                            </tr>
                        )}
                        {items.map((item, index) => {
                            const line = Number(item.quantity || 0) * Number(item.price || 0);
                            return (
                                <tr key={index} className="border-t border-slate-100">
                                    <td className="px-3 py-2">{item.service_name}</td>
                                    <td className="px-3 py-2">
                                        <input
                                            className="w-full rounded border border-slate-200 px-2 py-1"
                                            value={item.description || ''}
                                            onChange={(e) => update(index, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full rounded border border-slate-200 px-2 py-1"
                                            value={item.quantity}
                                            onChange={(e) => update(index, 'quantity', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-full rounded border border-slate-200 px-2 py-1"
                                            value={item.price}
                                            onChange={(e) => update(index, 'price', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-3 py-2">{money(line)}</td>
                                    <td className="px-3 py-2">
                                        <Button type="button" variant="ghost" onClick={() => remove(index)}>
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
            <div className="mt-4 ml-auto w-64 space-y-1 text-sm">
                <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                    <span>VAT ({vatRate}%)</span>
                    <span>{money(vat)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{money(total)}</span>
                </div>
            </div>
        </div>
    );
}
