import { useState } from 'react';
import { useUi } from '../context/UiContext';
import { t } from '../lib/i18n';

export default function CopyLinkButton({ url, className = '', labelKey = 'common.copy_link' }) {
    const { toast } = useUi();
    const [copied, setCopied] = useState(false);

    if (!url) {
        return null;
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success(t('common.copied'), 2500);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.warning(t('common.copy_failed'));
        }
    };

    return (
        <button type="button" onClick={copy} className={className}>
            {copied ? t('common.copied') : t(labelKey)}
        </button>
    );
}
