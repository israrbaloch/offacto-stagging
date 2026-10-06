import Modal from './Modal';
import { t } from '../lib/i18n';

export default function PdfPreviewModal({ open, onClose, previewUrl, downloadUrl, title }) {
    return (
        <Modal open={open} title={title || t('offers.pdf_preview_title')} onClose={onClose}>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {previewUrl && (
                    <iframe title={title || 'PDF preview'} src={previewUrl} className="h-[min(70vh,520px)] w-full bg-white" />
                )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                    {t('common.close')}
                </button>
                {downloadUrl && (
                    <a
                        href={downloadUrl}
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        {t('offers.download_pdf')}
                    </a>
                )}
            </div>
        </Modal>
    );
}
