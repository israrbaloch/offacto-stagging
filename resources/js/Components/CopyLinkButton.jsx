import { useState } from 'react';
import { t } from '../lib/i18n';

export default function CopyLinkButton({ url, className = '', labelKey = 'common.copy_link' }) {
    const [copied, setCopied] = useState(false);

    if (!url) {
        return null;
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt(t('common.copy_link_prompt'), url);
        }
    };

    return (
        <button type="button" onClick={copy} className={className}>
            {copied ? t('common.copied') : t(labelKey)}
        </button>
    );
}
