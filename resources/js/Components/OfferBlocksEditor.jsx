import { router } from '@inertiajs/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useUi } from '../context/UiContext';
import { blockImageUrl, emptyTableRows } from '../lib/offerBlocks';
import { t } from '../lib/i18n';
import Icon from './Icon';
import OfferBlockTableEditor from './OfferBlockTableEditor';

const blockTypes = [
    { value: 'text', labelKey: 'offers.block_type_text' },
    { value: 'image', labelKey: 'offers.block_type_image' },
    { value: 'video', labelKey: 'offers.block_type_video' },
    { value: 'table', labelKey: 'offers.block_type_table' },
];

function newClientKey() {
    return `blk-${crypto.randomUUID()}`;
}

function normalizeInitial(initialBlocks) {
    if (!initialBlocks.length) {
        return [];
    }
    return initialBlocks.map((block, index) => ({
        clientKey: block.id ? `id-${block.id}` : newClientKey(),
        type: block.type,
        sort_order: block.sort_order ?? index,
        content: block.content || {},
    }));
}

function xsrfToken() {
    const match = document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='));
    return match ? decodeURIComponent(match.split('=')[1]) : '';
}

export default function OfferBlocksEditor({ offerId, initialBlocks = [] }) {
    const { toast } = useUi();
    const [blocks, setBlocks] = useState(() => normalizeInitial(initialBlocks));
    const [dragIndex, setDragIndex] = useState(null);
    const [uploadingKey, setUploadingKey] = useState(null);
    const [saving, setSaving] = useState(false);
    const dragKey = useRef(null);

    const reorder = useCallback((from, to) => {
        if (from === to || from == null || to == null) {
            return;
        }
        setBlocks((current) => {
            const next = [...current];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            return next.map((block, index) => ({ ...block, sort_order: index }));
        });
    }, []);

    const updateBlock = useCallback((index, patch) => {
        setBlocks((current) => current.map((block, i) => (i === index ? { ...block, ...patch } : block)));
    }, []);

    const updateContent = useCallback((index, content) => {
        setBlocks((current) => current.map((block, i) => (i === index ? { ...block, content } : block)));
    }, []);

    const addBlock = (type = 'text') => {
        const content =
            type === 'table'
                ? { rows: emptyTableRows(2, 2) }
                : type === 'text'
                  ? { text: '' }
                  : { url: '' };
        setBlocks((current) => [
            ...current,
            { clientKey: newClientKey(), type, sort_order: current.length, content },
        ]);
    };

    const save = () => {
        setSaving(true);
        const payload = blocks.map((block, index) => ({
            type: block.type,
            sort_order: index,
            content: block.content || {},
        }));
        router.post(
            `/offers/${offerId}/blocks`,
            { blocks: payload },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    const uploadImage = async (clientKey, file) => {
        if (!file) {
            return;
        }
        setUploadingKey(clientKey);
        try {
            const body = new FormData();
            body.append('file', file);
            const response = await fetch(`/offers/${offerId}/blocks/image`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                credentials: 'same-origin',
                body,
            });
            if (!response.ok) {
                throw new Error('upload failed');
            }
            const data = await response.json();
            setBlocks((current) =>
                current.map((block) =>
                    block.clientKey === clientKey
                        ? {
                              ...block,
                              content: { path: data.path, url: data.url },
                          }
                        : block,
                ),
            );
            toast.success(t('offers.block_image_uploaded'), 2500);
        } catch {
            toast.error(t('offers.block_image_upload_failed'));
        } finally {
            setUploadingKey(null);
        }
    };

    const blockLabels = useMemo(
        () =>
            blockTypes.map((type) => ({
                value: type.value,
                label: t(type.labelKey),
            })),
        [],
    );

    if (!offerId) {
        return <p className="text-sm text-slate-400">{t('offers.blocks_save_first')}</p>;
    }

    return (
        <div className="space-y-4">
            {blocks.length === 0 && (
                <p className="text-sm text-slate-500">{t('offers.blocks_empty_hint')}</p>
            )}
            {blocks.map((block, index) => (
                <div
                    key={block.clientKey}
                    draggable
                    onDragStart={() => {
                        dragKey.current = block.clientKey;
                        setDragIndex(index);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                    }}
                    onDrop={() => {
                        const from = blocks.findIndex((b) => b.clientKey === dragKey.current);
                        reorder(from, index);
                        setDragIndex(null);
                        dragKey.current = null;
                    }}
                    onDragEnd={() => {
                        setDragIndex(null);
                        dragKey.current = null;
                    }}
                    className={`rounded-xl border bg-white p-4 transition ${
                        dragIndex === index ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'
                    }`}
                >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            className="cursor-grab rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 active:cursor-grabbing"
                            aria-label={t('offers.block_drag')}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <Icon name="dots-vertical" className="h-5 w-5" />
                        </button>
                        <select
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={block.type}
                            onChange={(e) => {
                                const type = e.target.value;
                                let content = block.content;
                                if (type === 'table' && !content?.rows) {
                                    content = { rows: emptyTableRows(2, 2) };
                                }
                                updateBlock(index, { type, content });
                            }}
                        >
                            {blockLabels.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <span className="text-xs text-slate-400">#{index + 1}</span>
                        <button
                            type="button"
                            className="ml-auto text-sm text-rose-600 hover:text-rose-700"
                            onClick={() => setBlocks((current) => current.filter((_, i) => i !== index))}
                        >
                            {t('common.delete')}
                        </button>
                    </div>

                    {block.type === 'text' && (
                        <textarea
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={block.content?.text || ''}
                            onChange={(e) => updateContent(index, { text: e.target.value })}
                        />
                    )}

                    {block.type === 'image' && (
                        <div className="space-y-3">
                            {blockImageUrl(block.content) && (
                                <img
                                    src={blockImageUrl(block.content)}
                                    alt=""
                                    className="max-h-48 rounded-lg border border-slate-100 object-contain"
                                />
                            )}
                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-slate-600">{t('offers.block_image_upload')}</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    disabled={uploadingKey === block.clientKey}
                                    className="block w-full text-sm text-slate-600"
                                    onChange={(e) => {
                                        uploadImage(block.clientKey, e.target.files?.[0]);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                            <div>
                                <span className="mb-1 block text-xs font-medium text-slate-600">{t('offers.block_image_url')}</span>
                                <input
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    placeholder="https://"
                                    value={block.content?.path ? '' : block.content?.url || ''}
                                    onChange={(e) => updateContent(index, { url: e.target.value, path: undefined })}
                                />
                            </div>
                        </div>
                    )}

                    {block.type === 'video' && (
                        <input
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            placeholder="https://"
                            value={block.content?.url || ''}
                            onChange={(e) => updateContent(index, { url: e.target.value })}
                        />
                    )}

                    {block.type === 'table' && (
                        <OfferBlockTableEditor content={block.content} onChange={(content) => updateContent(index, content)} />
                    )}
                </div>
            ))}

            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => addBlock('text')} className="rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
                    {t('offers.block_add_text')}
                </button>
                <button type="button" onClick={() => addBlock('image')} className="rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
                    {t('offers.block_add_image')}
                </button>
                <button type="button" onClick={() => addBlock('table')} className="rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
                    {t('offers.block_add_table')}
                </button>
                <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                    {saving ? `${t('common.save')}…` : t('offers.blocks_save')}
                </button>
            </div>
        </div>
    );
}
