import { useState } from 'react';
import Icon from './Icon';
import { useUi } from '../context/UiContext';
import { t } from '../lib/i18n';

export default function CopyLinkButton({ url, className = '', labelKey = 'common.copy_link', showIcon = false }) {
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
            {showIcon ? <Icon name="copy" /> : null}
            {copied ? t('common.copied') : t(labelKey)}
        </button>
    );
}
