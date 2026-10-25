import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { t } from '../lib/i18n';

export const SUPPORT_TICKET_MAX_IMAGES = 5;

/**
 * @param {{ files: File[], onChange: (files: File[]) => void, compact?: boolean }} props
 */
export default function SupportTicketImagePicker({ files = [], onChange, compact = false }) {
    const inputRef = useRef(null);
    const [previewUrls, setPreviewUrls] = useState([]);

    useEffect(() => {
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [files]);

    function addFiles(fileList) {
        if (!fileList?.length) {
            return;
        }
        const next = [...files];
        for (const file of fileList) {
            if (!file.type.startsWith('image/')) {
                continue;
            }
            if (next.length >= SUPPORT_TICKET_MAX_IMAGES) {
                break;
            }
            next.push(file);
        }
        onChange(next);
    }

    function removeAt(index) {
        onChange(files.filter((_, i) => i !== index));
    }

    const atMax = files.length >= SUPPORT_TICKET_MAX_IMAGES;

    return (
        <div className={`offacto-support-image-picker${compact ? ' is-compact' : ''}`}>
            <span className="offacto-drawer-lbl">{t('support.attach_images')}</span>
            {files.length > 0 ? (
                <ul className="offacto-support-image-picker-list">
                    {files.map((file, index) => (
                        <li key={`${file.name}-${file.size}-${index}`}>
                            <img src={previewUrls[index]} alt="" />
                            <button
                                type="button"
                                className="offacto-support-image-picker-remove"
                                aria-label={t('common.delete')}
                                onClick={() => removeAt(index)}
                            >
                                <Icon name="x" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
            <label
                className={`offacto-drawer-drop offacto-support-image-drop${atMax ? ' is-disabled' : ''}`}
                onClick={(e) => {
                    if (atMax) {
                        e.preventDefault();
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!atMax) {
                        e.currentTarget.classList.add('over');
                    }
                }}
                onDragLeave={(e) => e.currentTarget.classList.remove('over')}
                onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('over');
                    if (!atMax) {
                        addFiles(e.dataTransfer.files);
                    }
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    multiple
                    disabled={atMax}
                    onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = '';
                    }}
                />
                <Icon name="up" />
                <div>
                    <b>{t('support.image_drop_title')}</b>
                    <br />
                    <small>{t('support.image_drop_hint', { max: String(SUPPORT_TICKET_MAX_IMAGES) })}</small>
                </div>
            </label>
        </div>
    );
}
