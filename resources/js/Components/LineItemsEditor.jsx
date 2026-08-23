import { money } from '../lib/utils';

export default function LineItemsEditor({ items, setItems, services = [], vatRate = 21, error }) {
    const addService = (service) => {
        setItems([
            ...items,
            {
                kind: 'service',
                service_id: service.id,
                service_name: service.name,
                description: service.description || '',
                quantity: 1,
                price: Number(service.price || 0),
            },
        ]);
    };

    const addCustomLine = () => {
        const first = services[0];
        setItems([
            ...items,
            {
                kind: 'custom',
                service_id: first?.id || '',
                service_name: first?.name || 'Custom line',
                description: '',
                quantity: 1,
                price: 0,
            },
        ]);
    };

    const addTextLine = () => {
        const first = services[0];
        setItems([
            ...items,
            {
                kind: 'text',
                service_id: first?.id || '',
                service_name: 'Note',
                description: '',
                quantity: 1,
                price: 0,
            },
        ]);
    };

    const update = (index, key, value) => {
        setItems(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
    };

    const changeService = (index, serviceId) => {
        const service = services.find((item) => String(item.id) === String(serviceId));
        setItems(
            items.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          service_id: service?.id || '',
                          service_name: service?.name || item.service_name,
                          description: item.description || service?.description || '',
                          price: service ? Number(service.price || 0) : item.price,
                      }
                    : item,
            ),
        );
    };

    const remove = (index) => setItems(items.filter((_, i) => i !== index));

    const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
    const vat = subtotal * (Number(vatRate) / 100);
    const total = subtotal + vat;

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                            <th className="pb-3 pr-3 font-medium">Description</th>
                            <th className="w-24 pb-3 pr-3 font-medium">Number</th>
                            <th className="w-36 pb-3 pr-3 font-medium">Price (excl. VAT)</th>
                            <th className="w-28 pb-3 pr-3 font-medium">Total</th>
                            <th className="w-16 pb-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400">
                                    Add a product, quotation line, or note to get started.
                                </td>
                            </tr>
                        )}
                        {items.map((item, index) => {
                            const line = Number(item.quantity || 0) * Number(item.price || 0);
                            const isText = item.kind === 'text';
                            return (
                                <tr key={index} className="border-b border-slate-100">
                                    <td className="py-3 pr-3">
                                        {!isText && (
                                            <select
                                                className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                                                value={item.service_id}
                                                onChange={(e) => changeService(index, e.target.value)}
                                            >
                                                <option value="">Select a service</option>
                                                {services.map((service) => (
                                                    <option key={service.id} value={service.id}>
                                                        {service.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        <input
                                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                                            placeholder={isText ? 'Add a note for the client' : 'Describe this line'}
                                            value={item.description || ''}
                                            onChange={(e) => update(index, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td className="py-3 pr-3 align-top">
                                        {!isText && (
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                                                value={item.quantity}
                                                onChange={(e) => update(index, 'quantity', e.target.value)}
                                            />
                                        )}
                                    </td>
                                    <td className="py-3 pr-3 align-top">
                                        {!isText && (
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                                                value={item.price}
                                                onChange={(e) => update(index, 'price', e.target.value)}
                                            />
                                        )}
                                    </td>
                                    <td className="py-3 pr-3 align-top font-medium text-slate-800">
                                        {isText ? '—' : money(line)}
                                    </td>
                                    <td className="py-3 align-top">
                                        <button type="button" onClick={() => remove(index)} className="text-xs text-slate-400 hover:text-rose-600">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="relative">
                    <details className="group">
                        <summary className="cursor-pointer list-none font-medium text-indigo-600 hover:text-indigo-700">
                            + Add product
                        </summary>
                        <div className="absolute z-10 mt-2 max-h-56 w-64 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                            {services.length === 0 && <p className="px-2 py-3 text-xs text-slate-400">No services yet.</p>}
                            {services.map((service) => (
                                <button
                                    key={service.id}
                                    type="button"
                                    onClick={() => addService(service)}
                                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <span className="block font-medium">{service.name}</span>
                                    <span className="block text-xs text-slate-400">{money(service.price)}</span>
                                </button>
                            ))}
                        </div>
                    </details>
                </div>
                <button type="button" onClick={addCustomLine} className="font-medium text-indigo-600 hover:text-indigo-700">
                    + Add quotation line
                </button>
                <button type="button" onClick={addTextLine} className="font-medium text-indigo-600 hover:text-indigo-700">
                    + Add line of text
                </button>
            </div>

            {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

            <div className="mt-6 grid overflow-hidden rounded-2xl border border-slate-200 text-sm sm:grid-cols-3">
                <div className="bg-slate-50 px-5 py-4">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Subtotal</div>
                    <div className="mt-1 font-serif text-xl font-semibold text-slate-900">{money(subtotal)}</div>
                </div>
                <div className="bg-indigo-600 px-5 py-4 text-white">
                    <div className="text-xs uppercase tracking-wide text-indigo-200">Total incl. VAT</div>
                    <div className="mt-1 font-serif text-xl font-semibold">{money(total)}</div>
                </div>
                <div className="bg-indigo-50 px-5 py-4">
                    <div className="text-xs uppercase tracking-wide text-indigo-400">VAT ({vatRate}%)</div>
                    <div className="mt-1 font-serif text-xl font-semibold text-slate-900">{money(vat)}</div>
                </div>
            </div>
        </div>
    );
}
