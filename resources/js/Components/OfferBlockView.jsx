import { blockImageUrl, tableRowsFromContent } from '../lib/offerBlocks';

export default function OfferBlockView({ block, primary = '#4054b2' }) {
    if (!block) {
        return null;
    }

    if (block.type === 'text') {
        return <p className="whitespace-pre-wrap">{block.content?.text}</p>;
    }

    if (block.type === 'image') {
        const src = blockImageUrl(block.content);
        if (!src) {
            return null;
        }
        return <img src={src} alt="" className="max-h-80 w-full rounded-lg object-contain" />;
    }

    if (block.type === 'video' && block.content?.url) {
        return (
            <a href={block.content.url} className="font-medium hover:underline" style={{ color: primary }} target="_blank" rel="noreferrer">
                Watch video
            </a>
        );
    }

    if (block.type === 'table') {
        const rows = tableRowsFromContent(block.content);
        if (!rows.length) {
            return null;
        }
        const [head, ...body] = rows;
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                    {head?.length > 0 && (
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-100">
                                {head.map((cell, i) => (
                                    <th key={i} className="px-3 py-2 font-semibold text-slate-800">
                                        {cell}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {body.map((row, ri) => (
                            <tr key={ri} className="border-b border-slate-100">
                                {row.map((cell, ci) => (
                                    <td key={ci} className="px-3 py-2 text-slate-700">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return null;
}
