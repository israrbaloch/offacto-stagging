import Icon from './Icon';
import SelectMenu from './SelectMenu';
import {
    attachServiceFields,
    lineIsHourly,
    priceColumnLabel,
    quantityColumnLabel,
} from '../lib/serviceBilling';
import { money } from '../lib/utils';

export default function LineItemsEditor({
    items,
    setItems,
    services = [],
    vatRate = 21,
    error,
    variant = 'default',
    invoiceStyle = false,
    suppressToolbar = false,
    readOnly = false,
}) {
    const builder = variant === 'builder';
    const invoiceLines = builder && invoiceStyle;
    const inpClass = builder ? 'offacto-brief-inp offacto-quote-line-inp' : 'w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100';
    const selectClass = builder
        ? 'offacto-brief-inp offacto-quote-line-inp w-full'
        : 'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm outline-none';
    const addService = (service) => {
        if (readOnly) {
            return;
        }
        setItems([
            ...items,
            attachServiceFields(
                {
                    kind: 'service',
                    service_id: service.id,
                    service_name: service.name,
                    description: service.description || '',
                    quantity: 1,
                    price: Number(service.price || 0),
                },
                service,
            ),
        ]);
    };

    const addCustomLine = () => {
        if (readOnly) {
            return;
        }
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
        if (readOnly) {
            return;
        }
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
        if (readOnly) {
            return;
        }
        setItems(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
    };

    const linePrimaryLabel = (item) => {
        const desc = String(item.description || '').trim();
        if (desc) {
            return desc;
        }
        return item.service_name || '';
    };

    const updateLinePrimaryLabel = (index, value) => {
        if (readOnly) {
            return;
        }
        const service = services.find((s) => {
            const name = String(s.name || '');
            return name && (name.includes(value) || value.includes(name));
        });
        setItems(
            items.map((item, i) => {
                if (i !== index) {
                    return item;
                }
                const next = { ...item, description: value };
                if (service) {
                    next.service_id = service.id;
                    next.service_name = service.name;
                    next.price = Number(service.price || 0);
                    return attachServiceFields(next, service);
                }
                return next;
            }),
        );
    };

    const changeService = (index, serviceId) => {
        if (readOnly) {
            return;
        }
        const service = services.find((item) => String(item.id) === String(serviceId));
        setItems(
            items.map((item, i) => {
                if (i !== index) {
                    return item;
                }
                const next = {
                    ...item,
                    service_id: service?.id || '',
                    service_name: service?.name || item.service_name,
                    description: item.description || service?.description || '',
                    price: service ? Number(service.price || 0) : item.price,
                };
                return service ? attachServiceFields(next, service) : next;
            }),
        );
    };

    const remove = (index) => {
        if (readOnly) {
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
    const vat = subtotal * (Number(vatRate) / 100);
    const total = subtotal + vat;
    const qtyHeaderLong = quantityColumnLabel(items, services);
    const priceHeaderLong = priceColumnLabel(items, services);
    const pricedLines = items.filter((item) => item.kind !== 'text');
    const allHourly =
        pricedLines.length > 0 && pricedLines.every((item) => lineIsHourly(item, services));
    const qtyHeader = builder ? (allHourly ? 'Hours' : 'Qty') : qtyHeaderLong;
    const priceHeader = builder ? 'Price' : priceHeaderLong;

    const addButtons = (
        <>
            <div className="relative">
                <details className="group">
                    <summary className={builder ? 'offacto-quote-line-add' : 'inline-flex cursor-pointer list-none items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50'}>
                        <Icon name="plus" className={builder ? undefined : 'h-4 w-4 text-slate-500'} />
                        Product
                    </summary>
                    <div className={builder ? 'offacto-quote-line-menu' : 'absolute z-10 mt-2 max-h-56 w-64 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg'}>
                        {services.length === 0 && <p className="px-2 py-3 text-xs text-slate-400">No services yet.</p>}
                        {services.map((service) => (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() => addService(service)}
                                className={builder ? 'offacto-quote-line-menu-item' : 'block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50'}
                            >
                                <span className="block font-medium">{service.name}</span>
                                <span className="block text-xs text-slate-400">
                                    {money(service.price)}
                                    {service.billing_mode === 'hourly' || String(service.unit || '').toLowerCase().includes('hour')
                                        ? ' / hr'
                                        : service.unit
                                          ? ` / ${service.unit}`
                                          : ''}
                                </span>
                            </button>
                        ))}
                    </div>
                </details>
            </div>
            <button type="button" onClick={addCustomLine} className={builder ? 'offacto-quote-line-add' : 'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50'}>
                <Icon name="plus" className={builder ? undefined : 'h-4 w-4 text-slate-500'} />
                Custom line
            </button>
            <button type="button" onClick={addTextLine} className={builder ? 'offacto-quote-line-add' : 'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50'}>
                <Icon name="plus" className={builder ? undefined : 'h-4 w-4 text-slate-500'} />
                Note
            </button>
        </>
    );

    const toolbar =
        !suppressToolbar && !readOnly ? (
            <div className={builder ? 'offacto-quote-line-actions' : 'mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}>
                <div className="flex flex-wrap gap-2">{addButtons}</div>
            </div>
        ) : null;

    return (
        <div className={builder ? 'offacto-quote-lines-editor' : undefined}>
            {builder ? toolbar : null}
            <div className={builder ? 'offacto-quote-lines-scroll' : 'overflow-visible'}>
                <table className={builder ? 'offacto-quote-lines' : 'w-full min-w-[720px] text-left text-sm'}>
                    <thead>
                        <tr className={builder ? undefined : 'border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400'}>
                            <th className={builder ? undefined : 'pb-3 pr-3 font-medium'}>Description</th>
                            <th className={builder ? 'num' : 'w-24 pb-3 pr-3 font-medium'}>{qtyHeader}</th>
                            <th className={builder ? 'num' : 'w-36 pb-3 pr-3 font-medium'}>{priceHeader}</th>
                            {invoiceLines ? (
                                <th className={builder ? undefined : 'w-28 pb-3 pr-3 font-medium'}>VAT</th>
                            ) : null}
                            <th className={builder ? 'num' : 'w-28 pb-3 pr-3 font-medium'}>Total</th>
                            <th className={builder ? 'offacto-quote-lines-act' : 'w-16 pb-3'} aria-hidden={builder ? true : undefined} />
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td
                                    colSpan={invoiceLines ? 6 : 5}
                                    className={builder ? 'offacto-quote-lines-empty' : 'py-8 text-center text-slate-400'}
                                >
                                    Add a product, quotation line, or note to get started.
                                </td>
                            </tr>
                        )}
                        {items.map((item, index) => {
                            const line = Number(item.quantity || 0) * Number(item.price || 0);
                            const isText = item.kind === 'text';
                            return (
                                <tr key={index} className={builder ? 'offacto-quote-line-row' : 'border-b border-slate-100'}>
                                    <td {...(builder ? { 'data-label': 'Description' } : {})}>
                                        {!isText && !invoiceLines && !builder && (
                                            <div className="mb-2">
                                                <SelectMenu
                                                    className={selectClass}
                                                    variant="default"
                                                    value={item.service_id}
                                                    onChange={(e) => changeService(index, e.target.value)}
                                                    placeholder="Select a service"
                                                    options={services.map((service) => ({ value: service.id, label: service.name }))}
                                                />
                                            </div>
                                        )}
                                        <input
                                            className={inpClass}
                                            list={
                                                !isText && !readOnly
                                                    ? builder
                                                        ? 'offacto-quote-svc-list'
                                                        : invoiceLines
                                                          ? 'offacto-invoice-svc-list'
                                                          : undefined
                                                    : undefined
                                            }
                                            placeholder={isText ? 'Add a note for the client' : 'Describe this line'}
                                            value={builder && !isText ? linePrimaryLabel(item) : item.description || ''}
                                            onChange={(e) =>
                                                builder && !isText
                                                    ? updateLinePrimaryLabel(index, e.target.value)
                                                    : update(index, 'description', e.target.value)
                                            }
                                            readOnly={readOnly}
                                        />
                                    </td>
                                    <td
                                        className={builder ? 'num' : 'py-3 pr-3 align-top'}
                                        {...(builder ? { 'data-label': qtyHeader } : {})}
                                    >
                                        {!isText && (
                                            <input
                                                type="number"
                                                min={lineIsHourly(item, services) ? '0.25' : '1'}
                                                step={lineIsHourly(item, services) ? '0.25' : '1'}
                                                className={inpClass}
                                                value={item.quantity}
                                                onChange={(e) => update(index, 'quantity', e.target.value)}
                                                aria-label={lineIsHourly(item, services) ? 'Hours' : 'Quantity'}
                                                readOnly={readOnly}
                                            />
                                        )}
                                    </td>
                                    <td
                                        className={builder ? 'num' : 'py-3 pr-3 align-top'}
                                        {...(builder ? { 'data-label': priceHeader } : {})}
                                    >
                                        {!isText && (
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className={inpClass}
                                                value={item.price}
                                                onChange={(e) => update(index, 'price', e.target.value)}
                                                readOnly={readOnly}
                                            />
                                        )}
                                    </td>
                                    {invoiceLines ? (
                                        <td className={builder ? undefined : 'py-3 pr-3 align-top'}>
                                            {!isText && (
                                                <select
                                                    className={`${inpClass} offacto-invoice-vat-inp`}
                                                    value={String(vatRate)}
                                                    aria-label="VAT"
                                                    onChange={() => {}}
                                                    disabled={readOnly}
                                                >
                                                    <option value="21">21%</option>
                                                    <option value="12">12%</option>
                                                    <option value="6">6%</option>
                                                    <option value="0">{vatRate === 0 ? '0% · IC' : '0%'}</option>
                                                </select>
                                            )}
                                        </td>
                                    ) : null}
                                    <td
                                        className={builder ? 'num' : 'py-3 pr-3 align-top font-medium text-slate-800'}
                                        {...(builder ? { 'data-label': 'Total' } : {})}
                                    >
                                        {isText ? '—' : <b>{money(line)}</b>}
                                    </td>
                                    <td className={builder ? 'offacto-quote-lines-act' : 'py-3 align-top'}>
                                        {!readOnly ? (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className={builder ? 'offacto-quote-line-x' : 'rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600'}
                                                aria-label="Remove line"
                                            >
                                                <Icon name="trash" className={builder ? undefined : 'h-4 w-4'} />
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {builder && !readOnly ? (
                <datalist id="offacto-quote-svc-list">
                    {services.map((service) => (
                        <option key={service.id} value={service.name} />
                    ))}
                </datalist>
            ) : null}

            {invoiceLines ? (
                <datalist id="offacto-invoice-svc-list">
                    {services.map((service) => (
                        <option key={service.id} value={service.name} />
                    ))}
                </datalist>
            ) : null}

            {!builder ? toolbar : null}

            {error && <p className={builder ? 'offacto-quote-hint' : 'mt-2 text-xs text-rose-600'}>{error}</p>}

            {builder ? (
                <div className="offacto-quote-tot">
                    <div>
                        <span>Subtotal</span>
                        <b>{money(subtotal)}</b>
                    </div>
                    <div className="muted">
                        <span>VAT ({vatRate}%)</span>
                        <span>{money(vat)}</span>
                    </div>
                    <div className="big">
                        <span>Total</span>
                        <span>{money(total)}</span>
                    </div>
                </div>
            ) : (
                <div className="mt-6 flex justify-end">
                    <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm">
                        <div className="flex items-center justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span className="font-medium text-slate-800">{money(subtotal)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-slate-500">
                            <span>VAT ({vatRate}%)</span>
                            <span className="font-medium text-slate-800">{money(vat)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="font-semibold text-slate-900">Total</span>
                            <span className="text-lg font-semibold text-indigo-600">{money(total)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
