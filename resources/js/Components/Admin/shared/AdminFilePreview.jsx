import { AdminButton, AdminTextButton } from '../ui';

/** SH-017 — secure file preview + download actions. */
export default function AdminFilePreview({ filename, mime, previewUrl, downloadUrl, onDownload }) {
    const isPdf = mime?.includes('pdf') || filename?.toLowerCase().endsWith('.pdf');
    const isImage = mime?.startsWith('image/');

    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-medium text-slate-900">{filename || 'Attachment'}</p>
                <div className="flex gap-2">
                    {downloadUrl && (
                        <AdminButton type="button" variant="secondary" onClick={() => (onDownload ? onDownload() : window.open(downloadUrl, '_blank'))}>
                            Download
                        </AdminButton>
                    )}
                </div>
            </div>
            <div className="flex min-h-[12rem] items-center justify-center bg-slate-50 p-4">
                {previewUrl && isImage && <img src={previewUrl} alt="" className="max-h-96 max-w-full rounded-lg object-contain" />}
                {previewUrl && isPdf && <iframe title={filename} src={previewUrl} className="h-96 w-full rounded-lg border border-slate-200 bg-white" />}
                {!previewUrl && <p className="text-sm text-slate-400">Preview not available for this file type.</p>}
            </div>
        </div>
    );
}
