import { useEffect, useRef } from 'react';
import { AuthDiamond } from '../Layouts/AuthSplitLayout';
import Icon from './Icon';
import LineItemsEditor from './LineItemsEditor';
import { blockDocumentUrl, blockImageUrl } from '../lib/offerBlocks';
import { t } from '../lib/i18n';

function SignPad({ blockKey }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return undefined;
        }
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#0e1250';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        let drawing = false;

        const point = (e) => {
            const b = canvas.getBoundingClientRect();
            return [e.clientX - b.left, e.clientY - b.top];
        };

        const down = (e) => {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(...point(e));
            canvas.setPointerCapture(e.pointerId);
        };
        const move = (e) => {
            if (!drawing) {
                return;
            }
            ctx.lineTo(...point(e));
            ctx.stroke();
        };
        const up = () => {
            drawing = false;
        };

        canvas.addEventListener('pointerdown', down);
        canvas.addEventListener('pointermove', move);
        canvas.addEventListener('pointerup', up);
        canvas.addEventListener('pointerleave', up);

        return () => {
            canvas.removeEventListener('pointerdown', down);
            canvas.removeEventListener('pointermove', move);
            canvas.removeEventListener('pointerup', up);
            canvas.removeEventListener('pointerleave', up);
        };
    }, [blockKey]);

    return (
        <canvas ref={canvasRef} className="offacto-quote-sigpad" aria-label={t('offers.block_sign_draw')} />
    );
}

export default function QuoteBuilderBlockBody({
    block,
    onContentChange,
    items,
    setItems,
    servicesData,
    vatRate,
    onImageUpload,
    onDocumentUpload,
    uploading,
}) {
    const content = block.content || {};

    if (block.type === 'text') {
        return (
            <>
                <input
                    className="offacto-quote-ce-heading"
                    placeholder={t('offers.block_heading_placeholder')}
                    value={content.heading || ''}
                    onChange={(e) => onContentChange({ ...content, heading: e.target.value })}
                />
                <textarea
                    className="offacto-quote-ce-body"
                    rows={3}
                    placeholder={t('offers.block_body_placeholder')}
                    value={String(content.body || '').replace(/<[^>]+>/g, ' ')}
                    onChange={(e) => onContentChange({ ...content, body: e.target.value })}
                />
            </>
        );
    }

    if (block.type === 'image') {
        const src = blockImageUrl(content);
        return (
            <label className={`offacto-quote-media${src ? ' has-file' : ''}${uploading ? ' is-uploading' : ''}`}>
                <AuthDiamond size={80} className="offacto-quote-media-deco left-5 top-5" />
                <AuthDiamond size={50} delay="1s" className="offacto-quote-media-deco right-10 bottom-5" />
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onImageUpload) {
                            onImageUpload(file);
                        }
                        e.target.value = '';
                    }}
                />
                {src ? (
                    <>
                        <img src={src} alt="" className="offacto-quote-media-img" />
                        <span className="offacto-quote-media-change">
                            {uploading ? t('offers.block_document_uploading') : t('offers.block_image_upload')}
                        </span>
                    </>
                ) : (
                    <div className="offacto-quote-media-empty">
                        <Icon name="img" />
                        <p>{t('offers.block_image_drop')}</p>
                    </div>
                )}
            </label>
        );
    }

    if (block.type === 'video') {
        return (
            <>
                <div className="offacto-quote-media offacto-quote-media-video">
                    <div className="offacto-quote-media-play">
                        <Icon name="play" />
                    </div>
                    <span className="offacto-quote-media-caption">{t('offers.block_video_caption')}</span>
                </div>
                <input
                    className="offacto-brief-inp"
                    style={{ marginTop: 8 }}
                    placeholder="YouTube / Vimeo / Loom URL"
                    value={content.url || ''}
                    onChange={(e) => onContentChange({ url: e.target.value })}
                />
            </>
        );
    }

    if (block.type === 'table') {
        return (
            <div className="offacto-quote-lines-wrap">
                <LineItemsEditor
                    items={items}
                    setItems={setItems}
                    services={servicesData}
                    vatRate={vatRate}
                    variant="builder"
                />
                <p className="offacto-quote-hint">{t('offers.block_table_optional_hint')}</p>
            </div>
        );
    }

    if (block.type === 'sign') {
        return (
            <div className="offacto-quote-sign-grid">
                <div>
                    <SignPad blockKey={block.clientKey} />
                    <div className="offacto-quote-sign-meta">
                        <span>{t('offers.block_sign_draw')}</span>
                    </div>
                </div>
                <div className="offacto-brief-edit-fg">
                    <input
                        className="offacto-brief-inp"
                        placeholder={t('offers.block_signer_name')}
                        value={content.signer_name || ''}
                        onChange={(e) => onContentChange({ ...content, signer_name: e.target.value })}
                    />
                    <label className="offacto-quote-check">
                        <input type="checkbox" defaultChecked readOnly />
                        {t('offers.block_sign_terms')}
                    </label>
                    <p className="offacto-quote-hint">
                        <Icon name="lock" />
                        {t('offers.block_sign_legal_hint')}
                    </p>
                </div>
            </div>
        );
    }

    if (block.type === 'voice') {
        return (
            <>
                <div className="offacto-quote-voice">
                    <button type="button" className="offacto-btn-p offacto-quote-voice-btn">
                        <Icon name="mic" />
                    </button>
                    <div className="offacto-quote-wave" aria-hidden="true">
                        {Array.from({ length: 44 }).map((_, k) => (
                            <i key={k} style={{ height: `${6 + ((k * 13) % 26)}px`, animationDelay: `${(k % 7) * 0.08}s` }} />
                        ))}
                    </div>
                    <span className="offacto-quote-voice-time">0:00</span>
                </div>
                <p className="offacto-quote-hint">{t('offers.block_voice_hint')}</p>
            </>
        );
    }

    if (block.type === 'attachments') {
        const docUrl = blockDocumentUrl(content);
        const fileName = content.original_name || (docUrl ? docUrl.split('/').pop() : '');

        return (
            <label className={`offacto-quote-media offacto-quote-media-doc${docUrl ? ' has-file' : ''}${uploading ? ' is-uploading' : ''}`}>
                <AuthDiamond size={80} className="offacto-quote-media-deco left-5 top-5" />
                <AuthDiamond size={50} delay="1s" className="offacto-quote-media-deco right-10 bottom-5" />
                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,application/pdf"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onDocumentUpload) {
                            onDocumentUpload(file);
                        }
                        e.target.value = '';
                    }}
                />
                {docUrl ? (
                    <a
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="offacto-quote-doc-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="offacto-brief-av">
                            <Icon name="file" />
                        </span>
                        <span className="offacto-quote-doc-name">{fileName}</span>
                    </a>
                ) : (
                    <div className="offacto-quote-media-empty">
                        <Icon name="file" />
                        <p>{t('offers.block_document_drop')}</p>
                    </div>
                )}
                {docUrl ? (
                    <span className="offacto-quote-media-change">
                        {uploading ? t('offers.block_document_uploading') : t('offers.block_document_upload')}
                    </span>
                ) : null}
            </label>
        );
    }

    return null;
}
