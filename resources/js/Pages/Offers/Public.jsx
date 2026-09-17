import { router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { money } from '../../lib/utils';

function SignaturePad({ onChange }) {
    const canvasRef = useRef(null);
    const drawing = useRef(false);

    function start(event) {
        drawing.current = true;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    }

    function move(event) {
        if (!drawing.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
        ctx.stroke();
    }

    function end() {
        drawing.current = false;
        onChange(canvasRef.current?.toDataURL('image/png') || '');
    }

    return (
        <canvas
            ref={canvasRef}
            width={480}
            height={160}
            className="w-full rounded-xl border border-slate-200 bg-white"
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
        />
    );
}

export default function Public({ offer, token, canRespond }) {
    const [signature, setSignature] = useState('');
    const accept = useForm({ signature: '', voice_note: null });

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        {offer.company?.logo_url && (
                            <img src={offer.company.logo_url} alt="" className="mb-4 h-10 object-contain" />
                        )}
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Quotation {offer.offer_number}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">{offer.company?.name}</p>
                    </div>
                    <a
                        href={`/q/${token}/download`}
                        className="rounded-full border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                    >
                        Download PDF
                    </a>
                </div>

                {offer.accepted_at && (
                    <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        Accepted on {new Date(offer.accepted_at).toLocaleString()}
                    </div>
                )}
                {offer.declined_at && (
                    <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        Declined on {new Date(offer.declined_at).toLocaleString()}
                    </div>
                )}

                <div className="prose prose-sm mt-8 max-w-none text-slate-700">
                    {offer.intro && <p>{offer.intro}</p>}
                    {offer.desc && <p>{offer.desc}</p>}
                </div>

                {(offer.blocks || []).length > 0 && (
                    <div className="mt-8 space-y-4">
                        {offer.blocks.map((block) => (
                            <div key={block.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
                                {block.type === 'text' && <p>{block.content?.text}</p>}
                                {block.type === 'image' && block.content?.url && (
                                    <img src={block.content.url} alt="" className="max-h-64 rounded-lg object-contain" />
                                )}
                                {block.type === 'video' && block.content?.url && (
                                    <a href={block.content.url} className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">
                                        Watch video
                                    </a>
                                )}
                                {block.type === 'table' && (
                                    <pre className="whitespace-pre-wrap">{block.content?.markdown || block.content?.text}</pre>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <table className="mt-8 w-full text-left text-sm">
                    <thead className="text-slate-500">
                        <tr>
                            <th className="py-2">Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(offer.items || []).map((item, index) => (
                            <tr key={index} className="border-t border-slate-100">
                                <td className="py-2">{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{money(item.unit_price)}</td>
                                <td>{money(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 text-right text-sm font-medium text-slate-900">
                    Total {money(offer.total)}
                </div>

                {canRespond && (
                    <div className="mt-10 space-y-4 border-t border-slate-100 pt-8">
                        <div>
                            <div className="mb-2 text-sm font-medium text-slate-700">Signature (optional)</div>
                            <SignaturePad onChange={setSignature} />
                        </div>
                        <div>
                            <div className="mb-2 text-sm font-medium text-slate-700">Voice note (optional)</div>
                            <input
                                type="file"
                                accept="audio/*"
                                className="mb-4 block w-full text-sm"
                                onChange={(e) => accept.setData('voice_note', e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    accept.setData('signature', signature);
                                    accept.post(`/q/${token}/accept`, { forceFormData: true });
                                }}
                                className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
                            >
                                Accept quotation
                            </button>
                            <button
                                type="button"
                                onClick={() => router.post(`/q/${token}/decline`)}
                                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
