import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';
import { useDragDropFile } from '../lib/useDragDropFile';

const SIGNATURE_PAD_HEIGHT = 160;
const MAX_BYTES = 2 * 1024 * 1024;
const PNG_ACCEPT = 'image/png,.png';
const PNG_PREFIX = 'data:image/png';

function SignatureCanvas({ onChange, strokeColor = '#0f172a' }) {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const drawing = useRef(false);
    const hasStroke = useRef(false);

    const applyStrokeStyle = useCallback(
        (ctx) => {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        },
        [strokeColor],
    );

    const fitCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        const width = wrapper.clientWidth;
        const height = SIGNATURE_PAD_HEIGHT;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        applyStrokeStyle(ctx);
    }, [applyStrokeStyle]);

    useEffect(() => {
        fitCanvas();
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const ro = new ResizeObserver(() => fitCanvas());
        ro.observe(wrapper);
        return () => ro.disconnect();
    }, [fitCanvas]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        applyStrokeStyle(canvas.getContext('2d'));
    }, [applyStrokeStyle]);

    const pointFromEvent = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = event.touches?.[0]?.clientX ?? event.clientX;
        const clientY = event.touches?.[0]?.clientY ?? event.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    function start(event) {
        event.preventDefault();
        drawing.current = true;
        const ctx = canvasRef.current.getContext('2d');
        const { x, y } = pointFromEvent(event);
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function move(event) {
        if (!drawing.current) return;
        event.preventDefault();
        const ctx = canvasRef.current.getContext('2d');
        const { x, y } = pointFromEvent(event);
        ctx.lineTo(x, y);
        ctx.stroke();
        hasStroke.current = true;
    }

    function end() {
        drawing.current = false;
        if (hasStroke.current) {
            onChange(canvasRef.current?.toDataURL('image/png') || '');
        }
    }

    function clear() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        applyStrokeStyle(ctx);
        hasStroke.current = false;
        onChange('');
    }

    return (
        <div>
            <div ref={wrapperRef} className="h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                <canvas
                    ref={canvasRef}
                    className="block touch-none"
                    onMouseDown={start}
                    onMouseMove={move}
                    onMouseUp={end}
                    onMouseLeave={end}
                    onTouchStart={start}
                    onTouchMove={move}
                    onTouchEnd={end}
                />
            </div>
            <button type="button" onClick={clear} className="mt-2 text-sm font-medium text-slate-500 hover:text-slate-800">
                {t('offers.signature_clear')}
            </button>
        </div>
    );
}

export default function SignatureField({ value, onChange, strokeColor = '#0f172a', error }) {
    const [mode, setMode] = useState('draw');
    const [localError, setLocalError] = useState('');
    const fileInput = useRef(null);

    const clearAll = () => {
        setLocalError('');
        onChange('');
        if (fileInput.current) fileInput.current.value = '';
    };

    const handleFile = (file) => {
        setLocalError('');
        if (!file) {
            clearAll();
            return;
        }

        if (file.type !== 'image/png') {
            setLocalError(t('offers.signature_type_invalid'));
            onChange('');
            return;
        }

        const name = file.name.toLowerCase();
        if (!name.endsWith('.png')) {
            setLocalError(t('offers.signature_type_invalid'));
            onChange('');
            return;
        }

        if (file.size > MAX_BYTES) {
            setLocalError(t('offers.signature_too_large', { max: '2 MB' }));
            onChange('');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result !== 'string' || !result.startsWith(`${PNG_PREFIX};base64,`)) {
                setLocalError(t('offers.signature_type_invalid'));
                onChange('');
                return;
            }
            onChange(result);
        };
        reader.onerror = () => {
            setLocalError(t('offers.signature_type_invalid'));
            onChange('');
        };
        reader.readAsDataURL(file);
    };

    const { dragOver, dropzoneProps } = useDragDropFile((file) => {
        handleFile(file);
        if (fileInput.current) {
            fileInput.current.value = '';
        }
    });

    const displayError = error || localError;
    const hasPreview = typeof value === 'string' && value.startsWith(PNG_PREFIX);

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setMode('draw')}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${mode === 'draw' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                    {t('offers.signature_draw')}
                </button>
                <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${mode === 'upload' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                    {t('offers.signature_upload')}
                </button>
            </div>

            {mode === 'draw' && <SignatureCanvas onChange={onChange} strokeColor={strokeColor} />}

            {mode === 'upload' && (
                <>
                    <div
                        {...dropzoneProps}
                        role="button"
                        tabIndex={0}
                        onClick={() => fileInput.current?.click()}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                fileInput.current?.click();
                            }
                        }}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                            dragOver
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/30'
                        }`}
                    >
                        <span className="text-sm font-medium text-slate-700">{t('offers.signature_upload_hint')}</span>
                        <span className="mt-1 text-xs text-slate-500">{t('offers.signature_png_only')}</span>
                        <input
                            ref={fileInput}
                            type="file"
                            accept={PNG_ACCEPT}
                            className="sr-only"
                            onChange={(e) => handleFile(e.target.files?.[0] || null)}
                        />
                    </div>
                    {hasPreview && (
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                                <span>{t('offers.signature_label')}</span>
                                <button type="button" onClick={clearAll} className="font-medium text-rose-600 hover:text-rose-500">
                                    {t('common.delete')}
                                </button>
                            </div>
                            <img src={value} alt="" className="mx-auto max-h-40 w-auto object-contain" />
                        </div>
                    )}
                </>
            )}

            {displayError && <p className="text-xs text-rose-600">{displayError}</p>}
        </div>
    );
}
