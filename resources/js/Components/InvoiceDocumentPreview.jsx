import InvoicePreview from './InvoicePreview';
import InvoicePreviewMinimal from './InvoicePreviewMinimal';

export function normalizeInvoiceTemplate(template) {
    const key = String(template || 'classic').toLowerCase();
    return key === 'minimal' ? 'minimal' : 'classic';
}

export function invoiceTemplateLabel(template) {
    return normalizeInvoiceTemplate(template) === 'minimal' ? 'Minimal' : 'Classic';
}

export default function InvoiceDocumentPreview({ template = 'classic', middleContent, ...props }) {
    if (normalizeInvoiceTemplate(template) === 'minimal') {
        return <InvoicePreviewMinimal {...props} />;
    }
    return <InvoicePreview {...props} middleContent={middleContent} />;
}
