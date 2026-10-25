/**
 * @param {{ attachments?: { id: number, name: string, url: string, mime_type?: string }[] }} props
 */
export default function SupportMessageAttachments({ attachments = [] }) {
    if (!attachments.length) {
        return null;
    }

    return (
        <div className="offacto-support-msg-attachments">
            {attachments.map((file) => (
                <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="offacto-support-msg-attach"
                    title={file.name}
                >
                    <img src={file.url} alt={file.name} loading="lazy" />
                </a>
            ))}
        </div>
    );
}
