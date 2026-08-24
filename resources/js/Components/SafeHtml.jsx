import { isPlainText, sanitizeHtml } from '../lib/sanitizeHtml';

export default function SafeHtml({ value, className = '' }) {
    if (!value) return null;

    if (isPlainText(value)) {
        return <div className={`whitespace-pre-wrap ${className}`}>{value}</div>;
    }

    return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} />;
}
