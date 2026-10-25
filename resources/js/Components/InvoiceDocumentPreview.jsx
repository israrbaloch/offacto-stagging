import InvoicePreviewClassicPaper from './InvoicePreviewClassicPaper';
import InvoicePreviewMinimal from './InvoicePreviewMinimal';
import InvoicePreviewModern from './InvoicePreviewModern';

export function normalizeInvoiceTemplate(template) {
    const key = String(template || 'classic').toLowerCase();
    if (key === 'minimal') {
        return 'minimal';
    }
    if (key === 'modern') {
        return 'modern';
    }
    return 'classic';
}

export function invoiceTemplateLabel(template) {
    const key = normalizeInvoiceTemplate(template);
    if (key === 'minimal') {
        return 'Minimal';
    }
    if (key === 'modern') {
        return 'Modern';
    }
    return 'Classic';
}

export default function InvoiceDocumentPreview({ template = 'classic', documentType = 'invoice', ...props }) {
    const key = normalizeInvoiceTemplate(template);
    const shared = { documentType, ...props };
    if (key === 'minimal') {
        return <InvoicePreviewMinimal {...shared} />;
    }
    if (key === 'modern') {
        return <InvoicePreviewModern {...shared} />;
    }
    return <InvoicePreviewClassicPaper {...shared} />;
}

/** Quotes use the same company template as invoices. */
export function OfferDocumentPreview({ template, ...props }) {
    return <InvoiceDocumentPreview template={template} documentType="quote" {...props} />;
}
