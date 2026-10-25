import { router } from '@inertiajs/react';
import Icon from './Icon';
import CompanySettingsLegalDocumentsCta from './CompanySettingsLegalDocumentsCta';
import { t } from '../lib/i18n';
import {
    LEGAL_DOCUMENT_SLOTS,
    legalDocumentForSlot,
    legalDocumentRowLabel,
} from '../lib/legalDocumentSlots';

function LegalToggle({ checked, onChange, label, disabled }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`offacto-invoice-toggle${checked ? ' on' : ''}${disabled ? ' offacto-settings-legal-toggle-off' : ''}`}
        />
    );
}

function patchDoc(legalBase, doc, patch) {
    router.patch(`${legalBase}/${doc.id}`, patch, { preserveScroll: true });
}

function LegalFileCell({ doc, legalBase }) {
    if (!doc) {
        return <span className="offacto-settings-legal-no-file">{t('company_settings.legal_no_file')}</span>;
    }

    return (
        <a href={`${legalBase}/${doc.id}/download`} className="offacto-settings-legal-filename">
            {doc.original_name}
        </a>
    );
}

export default function CompanySettingsLegalDocumentsPanel({ legalDocuments = [], legalBase }) {
    return (
        <>
            <div className="offacto-settings-legal-table-wrap">
                <table className="offacto-settings-legal-table">
                    <thead>
                        <tr>
                            <th>{t('company_settings.legal_col_document')}</th>
                            <th>{t('company_settings.legal_col_file')}</th>
                            <th>{t('company_settings.legal_col_quotes')}</th>
                            <th>{t('company_settings.legal_col_invoices')}</th>
                            <th>{t('company_settings.legal_col_new_customers')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {LEGAL_DOCUMENT_SLOTS.map((slot) => {
                            const doc = legalDocumentForSlot(legalDocuments, slot.id);
                            const rowLabel = legalDocumentRowLabel(slot, doc, t);
                            const disabled = !doc;

                            return (
                                <tr key={slot.id}>
                                    <td className="offacto-settings-legal-doc-name">{rowLabel}</td>
                                    <td>
                                        <LegalFileCell doc={doc} legalBase={legalBase} />
                                    </td>
                                    <td className="offacto-settings-legal-toggle-cell">
                                        <LegalToggle
                                            label={t('company_settings.legal_col_quotes')}
                                            disabled={disabled}
                                            checked={!!doc?.attach_to_quotes_default}
                                            onChange={(checked) =>
                                                patchDoc(legalBase, doc, { attach_to_quotes_default: checked })
                                            }
                                        />
                                    </td>
                                    <td className="offacto-settings-legal-toggle-cell">
                                        <LegalToggle
                                            label={t('company_settings.legal_col_invoices')}
                                            disabled={disabled}
                                            checked={!!doc?.attach_to_invoices_default}
                                            onChange={(checked) =>
                                                patchDoc(legalBase, doc, { attach_to_invoices_default: checked })
                                            }
                                        />
                                    </td>
                                    <td className="offacto-settings-legal-toggle-cell">
                                        <LegalToggle
                                            label={t('company_settings.legal_col_new_customers')}
                                            disabled={disabled}
                                            checked={!!doc?.attach_new_customers_only}
                                            onChange={(checked) =>
                                                patchDoc(legalBase, doc, { attach_new_customers_only: checked })
                                            }
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="offacto-settings-legal-notice">
                <Icon name="alert" />
                <p>
                    {t('company_settings.legal_notice_before')}
                    <strong>{t('company_settings.legal_notice_quote')}</strong>
                    {t('company_settings.legal_notice_after')}
                </p>
            </div>

            <CompanySettingsLegalDocumentsCta />
        </>
    );
}
