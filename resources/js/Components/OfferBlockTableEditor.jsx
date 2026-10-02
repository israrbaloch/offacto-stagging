import { emptyTableRows, tableRowsFromContent } from '../lib/offerBlocks';

const inputClass =
    'w-full min-w-[4rem] rounded border border-transparent bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100';

export default function OfferBlockTableEditor({ content, onChange }) {
    const rows = tableRowsFromContent(content);

    const setRows = (next) => {
        onChange({ ...content, rows: next, markdown: undefined, text: undefined });
    };

    const updateCell = (rowIndex, colIndex, value) => {
        const next = rows.map((row, ri) => row.map((cell, ci) => (ri === rowIndex && ci === colIndex ? value : cell)));
        setRows(next);
    };

    const addRow = () => {
        const cols = rows[0]?.length || 2;
        setRows([...rows, Array.from({ length: cols }, () => '')]);
    };

    const addColumn = () => {
        setRows(rows.map((row) => [...row, '']));
    };

    const removeRow = (index) => {
        if (rows.length <= 1) {
            return;
        }
        setRows(rows.filter((_, i) => i !== index));
    };

    const removeColumn = (colIndex) => {
        if ((rows[0]?.length || 0) <= 1) {
            return;
        }
        setRows(rows.map((row) => row.filter((_, i) => i !== colIndex)));
    };

    const resetGrid = () => {
        const cols = rows[0]?.length || 2;
        setRows(emptyTableRows(cols, 2));
    };

    return (
        <div className="space-y-3">
            <p className="text-xs text-slate-500">First row is shown as the table header on the public quotation.</p>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-left text-sm">
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex === 0 ? 'bg-slate-50' : 'border-t border-slate-100'}>
                                {row.map((cell, colIndex) => (
                                    <td key={colIndex} className="p-1 align-top">
                                        <input
                                            type="text"
                                            className={inputClass}
                                            value={cell}
                                            placeholder={rowIndex === 0 ? `Header ${colIndex + 1}` : ''}
                                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                                        />
                                    </td>
                                ))}
                                <td className="w-8 p-1 align-middle">
                                    {rowIndex > 0 && (
                                        <button
                                            type="button"
                                            className="text-xs text-slate-400 hover:text-rose-600"
                                            onClick={() => removeRow(rowIndex)}
                                            aria-label="Remove row"
                                        >
                                            ×
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded-full border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50" onClick={addRow}>
                    Add row
                </button>
                <button type="button" className="rounded-full border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50" onClick={addColumn}>
                    Add column
                </button>
                {(rows[0]?.length || 0) > 1 && (
                    <button
                        type="button"
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50"
                        onClick={() => removeColumn((rows[0]?.length || 1) - 1)}
                    >
                        Remove column
                    </button>
                )}
                <button type="button" className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50" onClick={resetGrid}>
                    Reset
                </button>
            </div>
        </div>
    );
}
