import { router } from '@inertiajs/react';
import { useState } from 'react';

const blockTypes = [
    { value: 'text', label: 'Text' },
    { value: 'image', label: 'Image URL' },
    { value: 'video', label: 'Video URL' },
    { value: 'table', label: 'Table / markdown' },
];

export default function OfferBlocksEditor({ offerId, initialBlocks = [] }) {
    const [blocks, setBlocks] = useState(
        initialBlocks.length
            ? initialBlocks.map((block, index) => ({
                  type: block.type,
                  sort_order: block.sort_order ?? index,
                  content: block.content || {},
              }))
            : []
    );

    if (!offerId) {
        return <p className="text-sm text-slate-400">Save the quotation first to add content blocks.</p>;
    }

    function updateBlock(index, patch) {
        setBlocks((current) => current.map((block, i) => (i === index ? { ...block, ...patch } : block)));
    }

    function addBlock() {
        setBlocks((current) => [...current, { type: 'text', sort_order: current.length, content: { text: '' } }]);
    }

    function save() {
        router.post(`/offers/${offerId}/blocks`, { blocks });
    }

    return (
        <div className="space-y-4">
            {blocks.map((block, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                        <select
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={block.type}
                            onChange={(e) => updateBlock(index, { type: e.target.value })}
                        >
                            {blockTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <button type="button" className="text-sm text-rose-600" onClick={() => setBlocks((current) => current.filter((_, i) => i !== index))}>
                            Remove
                        </button>
                    </div>
                    {block.type === 'text' && (
                        <textarea
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={block.content?.text || ''}
                            onChange={(e) => updateBlock(index, { content: { text: e.target.value } })}
                        />
                    )}
                    {(block.type === 'image' || block.type === 'video') && (
                        <input
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            placeholder="https://"
                            value={block.content?.url || ''}
                            onChange={(e) => updateBlock(index, { content: { url: e.target.value } })}
                        />
                    )}
                    {block.type === 'table' && (
                        <textarea
                            rows={5}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                            value={block.content?.markdown || block.content?.text || ''}
                            onChange={(e) => updateBlock(index, { content: { markdown: e.target.value } })}
                        />
                    )}
                </div>
            ))}
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={addBlock} className="rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
                    Add block
                </button>
                <button type="button" onClick={save} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                    Save blocks
                </button>
            </div>
        </div>
    );
}
