import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { AuthDiamond } from '../Layouts/AuthSplitLayout';
import CopyLinkButton from './CopyLinkButton';
import Icon from './Icon';
import OfferAcceptancePanel from './OfferAcceptancePanel';
import { OfferDocumentPreview, normalizeInvoiceTemplate } from './InvoiceDocumentPreview';
import QuoteBuilderBlockBody from './QuoteBuilderBlockBody';
import SendOfferModal from './SendOfferModal';
import { useUi } from '../context/UiContext';
import { t } from '../lib/i18n';
import {
    QUOTE_BLOCK_TYPES,
    blocksToPayload,
    defaultContentForType,
    newClientKey,
    normalizeBlocks,
} from '../lib/quoteBuilderBlocks';
import { optionsFromMap } from '../lib/utils';

function dateValue(value) {
    if (!value) {
        return '';
    }
    return String(value).slice(0, 10);
}

function xsrfToken() {
    const match = document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='));
    return match ? decodeURIComponent(match.split('=')[1]) : '';
}

function statusBadgeClass(name) {
    const key = String(name || 'draft').toLowerCase();
    if (key === 'accepted') {
        return 'ok';
    }
    if (key === 'declined' || key === 'rejected') {
        return 'bad';
    }
    return 'grey';
}

function blockTypeLabel(type) {
    const found = QUOTE_BLOCK_TYPES.find((b) => b.type === type);
    return found ? t(found.labelKey) : type;
}

function blockTypeIcon(type) {
    return QUOTE_BLOCK_TYPES.find((b) => b.type === type)?.icon || 'file';
}

function formatValidUntil(value) {
    if (!value) {
        return '—';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return value;
    }
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function OfferQuoteBuilder({
    offer = null,
    customers = {},
    defaultStatusId,
    existingItems = [],
    vatRate = 21,
    nextOfferNumber = '',
    customersData = [],
    legalDocuments = [],
    servicesData = [],
    publicQuoteUrl = null,
    postbodeConfigured = false,
    whatsappConfigured = false,
    whatsappShareUrl = '',
}) {
    const { activeCompany } = usePage().props;
    const { toast } = useUi();
    const [autosaveReady, setAutosaveReady] = useState(false);
    const autosaveSkip = useRef(true);
    const [items, setItems] = useState(existingItems);
    const [blocks, setBlocks] = useState(() => normalizeBlocks(offer?.blocks || [], offer?.intro));
    const [selectedKey, setSelectedKey] = useState(null);
    const [dragType, setDragType] = useState(null);
    const [dropIndex, setDropIndex] = useState(null);
    const [uploadingKey, setUploadingKey] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [sendOpen, setSendOpen] = useState(false);
    const [savedAt, setSavedAt] = useState(offer?.updated_at || null);
    const [saving, setSaving] = useState(false);
    const [emailMessage] = useState(
        offer?.email_message ||
            'Hi #CLIENTNAME#,\n\n#COMPANY# has prepared an offer for you. Please review it here: #OFFERLINK#.\n\nBest regards,\n#COMPANY#',
    );
    const [selectedLegal, setSelectedLegal] = useState(() =>
        legalDocuments.filter((doc) => doc.attach_to_quotes_default).map((doc) => doc.id),
    );
    const [sendAttachments, setSendAttachments] = useState(() => offer?.attachments || []);
    const [uploadingExtra, setUploadingExtra] = useState(false);

    useEffect(() => {
        setSendAttachments(offer?.attachments || []);
    }, [offer?.attachments]);

    const form = useForm({
        customer_id: offer?.customer_id || '',
        offer_date: dateValue(offer?.offer_date) || new Date().toISOString().slice(0, 10),
        valid_until: dateValue(offer?.valid_until),
        status: offer?.status || defaultStatusId || '',
        quote_template: normalizeInvoiceTemplate(activeCompany?.invoice_template || offer?.quote_template || 'classic'),
        require_nda_before_open: offer?.require_nda_before_open ?? false,
        mollie_deposit_enabled: offer?.mollie_deposit_enabled ?? false,
        on_acceptance_invoice: offer?.on_acceptance_invoice || 'draft',
    });

    const selectedCustomer = customersData.find((item) => String(item.id) === String(form.data.customer_id));
    const customerOptions = optionsFromMap(customers);
    const statusName = offer?.status_relation?.name || 'Draft';
    const brand = activeCompany?.theme?.primary || '#6B59DC';
    const mid = '#9D8DF1';

    const sendAttachmentCount = selectedLegal.length + sendAttachments.length;

    const payloadFromState = useCallback(() => {
        const textBlocks = blocks.filter((b) => b.type === 'text');
        const intro = textBlocks[0]?.content?.body || '';
        const desc = textBlocks[1]?.content?.body || textBlocks[0]?.content?.heading || '';

        return {
            customer_id: form.data.customer_id || null,
            offer_date: form.data.offer_date || null,
            valid_until: form.data.valid_until || null,
            intro,
            desc,
            notes: null,
            payment_terms: null,
            status: form.data.status,
            quote_template: normalizeInvoiceTemplate(activeCompany?.invoice_template || form.data.quote_template),
            require_nda_before_open: form.data.require_nda_before_open,
            mollie_deposit_enabled: form.data.mollie_deposit_enabled,
            on_acceptance_invoice: form.data.on_acceptance_invoice,
            email_message: emailMessage,
            items: items
                .filter((item) => item.service_id)
                .map((item) => ({
                    service_id: item.service_id,
                    description: item.description,
                    quantity: item.kind === 'text' ? 1 : Math.max(1, Number.parseInt(String(item.quantity), 10) || 1),
                    price: item.kind === 'text' ? 0 : Number(item.price || 0),
                })),
        };
    }, [blocks, emailMessage, form.data, items]);

    const blocksPayload = useMemo(() => blocksToPayload(blocks), [blocks]);
    const itemsSignature = useMemo(() => JSON.stringify(items), [items]);

    const syncBlocks = useCallback(
        (payload = blocksPayload) => {
            if (!offer?.id) {
                return;
            }
            router.post(
                `/offers/${offer.id}/blocks`,
                { blocks: payload },
                { preserveScroll: true, preserveState: true },
            );
        },
        [blocksPayload, offer?.id],
    );

    useEffect(() => {
        autosaveSkip.current = true;
        setAutosaveReady(false);
        const timer = setTimeout(() => setAutosaveReady(true), 600);
        return () => clearTimeout(timer);
    }, [offer?.id]);

    useEffect(() => {
        if (!offer?.id || !autosaveReady) {
            return undefined;
        }
        if (autosaveSkip.current) {
            autosaveSkip.current = false;
            return undefined;
        }
        const timer = setTimeout(() => {
            setSaving(true);
            const payload = payloadFromState();
            form.transform(() => ({ ...payload, autosave: true }));
            form.put(`/offers/${offer.id}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setSavedAt(new Date().toISOString());
                    syncBlocks(blocksToPayload(blocks));
                },
                onError: () => {
                    syncBlocks(blocksToPayload(blocks));
                },
                onFinish: () => setSaving(false),
            });
        }, 1200);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autosaveReady, form.data, itemsSignature, blocksPayload, offer?.id]);

    const insertBlock = (type, index = blocks.length) => {
        const block = {
            clientKey: newClientKey(),
            type,
            sort_order: index,
            content: defaultContentForType(type),
        };
        setBlocks((current) => {
            const next = [...current];
            next.splice(index, 0, block);
            return next.map((b, i) => ({ ...b, sort_order: i }));
        });
        setSelectedKey(block.clientKey);
    };

    const moveBlock = (from, delta) => {
        const to = from + delta;
        if (to < 0 || to >= blocks.length) {
            return;
        }
        setBlocks((current) => {
            const next = [...current];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            return next.map((b, i) => ({ ...b, sort_order: i }));
        });
    };

    const updateBlockContent = (index, content) => {
        setBlocks((current) => current.map((b, i) => (i === index ? { ...b, content } : b)));
    };

    const uploadBlockImage = async (clientKey, file) => {
        if (!offer?.id || !file) {
            return;
        }
        setUploadingKey(clientKey);
        try {
            const body = new FormData();
            body.append('file', file);
            const response = await fetch(`/offers/${offer.id}/blocks/image`, {
                method: 'POST',
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
                credentials: 'same-origin',
                body,
            });
            if (!response.ok) {
                throw new Error('upload failed');
            }
            const data = await response.json();
            setBlocks((current) =>
                current.map((block) =>
                    block.clientKey === clientKey ? { ...block, content: { path: data.path, url: data.url } } : block,
                ),
            );
            toast.success(t('offers.block_image_uploaded'), 2500);
        } catch {
            toast.error(t('offers.block_image_upload_failed'));
        } finally {
            setUploadingKey(null);
        }
    };

    const uploadBlockDocument = async (clientKey, file) => {
        if (!offer?.id || !file) {
            return;
        }
        setUploadingKey(clientKey);
        try {
            const body = new FormData();
            body.append('file', file);
            const response = await fetch(`/offers/${offer.id}/blocks/document`, {
                method: 'POST',
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
                credentials: 'same-origin',
                body,
            });
            if (!response.ok) {
                throw new Error('upload failed');
            }
            const data = await response.json();
            setBlocks((current) =>
                current.map((block) =>
                    block.clientKey === clientKey
                        ? {
                              ...block,
                              content: {
                                  path: data.path,
                                  url: data.url,
                                  original_name: data.original_name || file.name,
                              },
                          }
                        : block,
                ),
            );
            toast.success(t('offers.block_document_uploaded'), 2500);
        } catch {
            toast.error(t('offers.block_document_upload_failed'));
        } finally {
            setUploadingKey(null);
        }
    };

    const uploadSendAttachment = async (file) => {
        if (!offer?.id || !file) {
            return;
        }
        setUploadingExtra(true);
        try {
            const body = new FormData();
            body.append('file', file);
            const response = await fetch(`/offers/${offer.id}/attachments`, {
                method: 'POST',
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
                credentials: 'same-origin',
                body,
            });
            if (!response.ok) {
                throw new Error('upload failed');
            }
            const data = await response.json();
            setSendAttachments((current) => [
                ...current,
                {
                    id: data.id,
                    original_name: data.original_name,
                    file_path: data.file_path,
                },
            ]);
            toast.success(t('offers.builder_extra_uploaded'), 2500);
        } catch {
            toast.error(t('offers.builder_extra_upload_failed'));
        } finally {
            setUploadingExtra(false);
        }
    };

    const removeSendAttachment = async (attachmentId) => {
        if (!offer?.id) {
            return;
        }
        try {
            const response = await fetch(`/offers/${offer.id}/attachments/${attachmentId}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
                credentials: 'same-origin',
            });
            if (!response.ok) {
                throw new Error('delete failed');
            }
            setSendAttachments((current) => current.filter((att) => att.id !== attachmentId));
        } catch {
            toast.error(t('offers.builder_extra_upload_failed'));
        }
    };

    const saveManual = (e) => {
        e?.preventDefault?.();
        if (!offer?.id) {
            return;
        }
        form.transform(() => payloadFromState());
        form.put(`/offers/${offer.id}`, {
            onSuccess: () => {
                setSavedAt(new Date().toISOString());
                syncBlocks(blocksToPayload(blocks));
                toast.success(t('offers.builder_saved'));
            },
        });
    };

    const openSendModal = () => {
        if (!offer?.id) {
            return;
        }
        if (!form.data.customer_id) {
            toast.error(t('offers.send_need_customer'));
            return;
        }
        setSendOpen(true);
    };

    const saveThen = (callback) => {
        form.transform(() => payloadFromState());
        form.put(`/offers/${offer.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                syncBlocks();
                callback?.();
            },
        });
    };

    const savedTimeLabel = useMemo(() => {
        if (!savedAt) {
            return null;
        }
        const d = new Date(savedAt);
        if (Number.isNaN(d.getTime())) {
            return null;
        }
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, [savedAt]);

    const savedLabel = saving
        ? t('offers.builder_saving')
        : savedTimeLabel
          ? t('offers.builder_saved_at', { time: savedTimeLabel })
          : t('offers.builder_draft_created');

    const onDropAt = (index) => {
        if (typeof dragType === 'string' && dragType.startsWith('move:')) {
            const from = Number.parseInt(dragType.split(':')[1], 10);
            if (!Number.isNaN(from) && from !== index) {
                setBlocks((current) => {
                    const next = [...current];
                    const [item] = next.splice(from, 1);
                    let to = index;
                    if (from < to) {
                        to -= 1;
                    }
                    next.splice(to, 0, item);
                    return next.map((b, i) => ({ ...b, sort_order: i }));
                });
            }
        } else if (dragType) {
            insertBlock(dragType, index);
        }
        setDragType(null);
        setDropIndex(null);
    };

    return (
        <AuthenticatedLayout title={offer?.offer_number || t('offers.new')} shellClass="offacto-demo-page-surface">
            <form onSubmit={saveManual} className="offacto-briefings offacto-dash offacto-quote-builder-page">
                <div className="offacto-brief-edit-ph">
                    <div>
                        <Link href="/offers" className="offacto-brief-edit-crumb">
                            <Icon name="back" />
                            {t('offers.title')}
                        </Link>
                        <h1>
                            {offer?.offer_number || nextOfferNumber}{' '}
                            <span className={`offacto-demo-badge ${statusBadgeClass(statusName)} nd`}>{statusName}</span>
                        </h1>
                        <p className="offacto-quote-builder-saved">{savedLabel}</p>
                    </div>
                    <div className="offacto-brief-edit-acts">
                        {publicQuoteUrl ? (
                            <CopyLinkButton
                                url={publicQuoteUrl}
                                labelKey="offers.copy_public_link"
                                className="offacto-brief-btn"
                                showIcon
                            />
                        ) : null}
                        <button type="button" className="offacto-brief-btn" onClick={() => setPreviewOpen(true)}>
                            <Icon name="eye" />
                            {t('offers.preview')}
                        </button>
                        <button type="button" className="offacto-brief-btn" onClick={saveManual}>
                            {t('offers.builder_save')}
                        </button>
                        <button
                            type="button"
                            className="offacto-btn-p"
                            disabled={form.processing || activeCompany?.trial_expired || activeCompany?.pending_approval}
                            onClick={openSendModal}
                        >
                            <Icon name="send" />
                            {t('offers.builder_send')}
                        </button>
                    </div>
                </div>

                {offer?.briefing_response?.briefing ? (
                    <div className="offacto-quote-builder-banner">
                        {t('offers.from_briefing_banner', { title: offer.briefing_response.briefing.title })}
                    </div>
                ) : null}

                {offer?.id ? <OfferAcceptancePanel offer={offer} compact /> : null}

                <div className="offacto-quote-builder">
                    <div className="offacto-brief-edit-card offacto-quote-aside-card">
                        <div className="offacto-brief-edit-card-h">
                            <h3>{t('offers.builder_blocks')}</h3>
                        </div>
                        <div className="offacto-quote-palette">
                            {QUOTE_BLOCK_TYPES.map((entry) => (
                                <div
                                    key={entry.type}
                                    className="offacto-quote-pal"
                                    draggable
                                    onDragStart={() => setDragType(entry.type)}
                                    onDragEnd={() => setDragType(null)}
                                    onClick={() => insertBlock(entry.type)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && insertBlock(entry.type)}
                                >
                                    <Icon name={entry.icon} />
                                    {t(entry.labelKey)}
                                </div>
                            ))}
                            <p className="offacto-quote-hint">{t('offers.builder_palette_hint')}</p>
                        </div>
                    </div>

                    <div className="offacto-brief-edit-card offacto-quote-canvas-card offacto-quote-center-card">
                        <div className="offacto-quote-canvas-bar" style={{ background: `linear-gradient(90deg, ${brand}, ${mid})` }} />
                        <div className="offacto-quote-canvas">
                            <div className="offacto-quote-canvas-head offacto-quote-canvas-head-demo">
                                <div className="offacto-quote-canvas-brand">
                                    {activeCompany?.invoice_logo_url ? (
                                        <img src={activeCompany.invoice_logo_url} alt="" />
                                    ) : (
                                        <Icon name="build" />
                                    )}
                                    <b>{activeCompany?.company_name}</b>
                                </div>
                                <span className="offacto-quote-hint">
                                    {t('offers.valid_until_label')} {formatValidUntil(form.data.valid_until)}
                                </span>
                            </div>

                            {blocks.map((block, index) => (
                                <div key={block.clientKey}>
                                    <div
                                        className={`offacto-quote-dz ${dropIndex === index ? 'over' : ''}`}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setDropIndex(index);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            onDropAt(index);
                                        }}
                                    />
                                    <div
                                        className={`offacto-quote-blk ${selectedKey === block.clientKey ? 'sel' : ''}`}
                                        onClick={() => setSelectedKey(block.clientKey)}
                                        draggable
                                        onDragStart={() => setDragType(`move:${index}`)}
                                        onDragEnd={() => setDragType(null)}
                                    >
                                        <span className="offacto-quote-blk-hdl">
                                            <Icon name="grip" />
                                        </span>
                                        <div className="offacto-quote-blk-tools">
                                            <button type="button" onClick={() => moveBlock(index, -1)} aria-label="Up">
                                                ↑
                                            </button>
                                            <button type="button" onClick={() => moveBlock(index, 1)} aria-label="Down">
                                                ↓
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBlocks((c) => c.filter((_, i) => i !== index))}
                                                aria-label={t('common.delete')}
                                            >
                                                <Icon name="trash" />
                                            </button>
                                        </div>
                                        <div className="offacto-quote-blk-ttl">
                                            <Icon name={blockTypeIcon(block.type)} />
                                            {blockTypeLabel(block.type)}
                                        </div>
                                        <QuoteBuilderBlockBody
                                            block={block}
                                            onContentChange={(content) => updateBlockContent(index, content)}
                                            items={items}
                                            setItems={setItems}
                                            servicesData={servicesData}
                                            vatRate={vatRate}
                                            uploading={uploadingKey === block.clientKey}
                                            onImageUpload={(file) => uploadBlockImage(block.clientKey, file)}
                                            onDocumentUpload={(file) => uploadBlockDocument(block.clientKey, file)}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div
                                className={`offacto-quote-dz offacto-quote-dz-end ${dropIndex === blocks.length ? 'over' : ''}`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDropIndex(blocks.length);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    onDropAt(blocks.length);
                                }}
                            >
                                {t('offers.builder_drop_here')}
                            </div>
                        </div>
                    </div>

                    <div className="offacto-quote-bset">
                        <div className="offacto-brief-edit-card offacto-quote-aside-card">
                            <div className="offacto-brief-edit-card-h">
                                <h3>{t('offers.builder_quote_settings')}</h3>
                            </div>
                            <div className="offacto-brief-edit-card-b offacto-brief-edit-fg">
                                <label>
                                    <span className="offacto-brief-edit-lbl">{t('dashboard.customer')}</span>
                                    <select
                                        className="offacto-brief-inp"
                                        value={form.data.customer_id}
                                        onChange={(e) => form.setData('customer_id', e.target.value)}
                                    >
                                        <option value="">{t('offers.select_customer')}</option>
                                        {customerOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <p className="offacto-quote-hint">
                                    {t('company_settings.template_company_hint')}{' '}
                                    <Link href="/company/settings?section=branding" className="text-indigo-600 underline">
                                        {t('company_settings.nav_branding')}
                                    </Link>
                                </p>
                                <label>
                                    <span className="offacto-brief-edit-lbl">{t('offers.valid_until_label')}</span>
                                    <input
                                        type="date"
                                        className="offacto-brief-inp"
                                        value={form.data.valid_until}
                                        onChange={(e) => form.setData('valid_until', e.target.value)}
                                    />
                                </label>
                                <div className="offacto-brief-row">
                                    <span>{t('offers.builder_nda')}</span>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={form.data.require_nda_before_open}
                                        className={`offacto-brief-toggle ${form.data.require_nda_before_open ? 'on' : ''}`}
                                        onClick={() =>
                                            form.setData('require_nda_before_open', !form.data.require_nda_before_open)
                                        }
                                    />
                                </div>
                                <div className="offacto-brief-row">
                                    <span>{t('offers.builder_mollie')}</span>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={form.data.mollie_deposit_enabled}
                                        className={`offacto-brief-toggle ${form.data.mollie_deposit_enabled ? 'on' : ''}`}
                                        onClick={() => form.setData('mollie_deposit_enabled', !form.data.mollie_deposit_enabled)}
                                    />
                                </div>
                                <label className="offacto-brief-row">
                                    <span>{t('offers.builder_on_accept')}</span>
                                    <select
                                        className="offacto-brief-inp"
                                        style={{ width: 'auto', padding: '6px 8px' }}
                                        value={form.data.on_acceptance_invoice}
                                        onChange={(e) => form.setData('on_acceptance_invoice', e.target.value)}
                                    >
                                        <option value="draft">{t('offers.kpi_draft')}</option>
                                        <option value="send">{t('offers.builder_send_now')}</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="offacto-brief-edit-card offacto-quote-aside-card">
                            <div className="offacto-brief-edit-card-h">
                                <h3>{t('offers.builder_attachments')}</h3>
                                {sendAttachmentCount > 0 ? (
                                    <span className="offacto-demo-badge ok nd">{sendAttachmentCount}</span>
                                ) : null}
                            </div>
                            <div className="offacto-brief-edit-card-b offacto-brief-edit-fg">
                                <p className="offacto-quote-hint">{t('offers.builder_send_attachments_hint')}</p>
                                {legalDocuments.length > 0 ? (
                                    <div className="offacto-quote-aside-legal">
                                        <span className="offacto-brief-edit-lbl">{t('offers.builder_company_documents')}</span>
                                        <ul className="offacto-quote-aside-legal-list">
                                            {legalDocuments.map((doc) => (
                                                <li key={doc.id}>
                                                    <label className="offacto-quote-aside-legal-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedLegal.includes(doc.id)}
                                                            onChange={(e) => {
                                                                setSelectedLegal((ids) =>
                                                                    e.target.checked
                                                                        ? [...ids, doc.id]
                                                                        : ids.filter((id) => id !== doc.id),
                                                                );
                                                            }}
                                                        />
                                                        <Icon name="file" />
                                                        <span title={doc.original_name}>{doc.original_name}</span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="offacto-quote-hint">{t('offers.builder_no_company_documents')}</p>
                                )}
                                {sendAttachments.length > 0 ? (
                                    <div className="offacto-quote-aside-extra-list">
                                        {sendAttachments.map((att) => (
                                            <div key={att.id} className="offacto-quote-att-row">
                                                <Icon name="clip" />
                                                <div className="min-w-0 flex-1">
                                                    <span className="offacto-quote-att-row__name" title={att.original_name}>
                                                        {att.original_name}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="offacto-quote-att-remove"
                                                    aria-label={t('common.delete')}
                                                    onClick={() => removeSendAttachment(att.id)}
                                                >
                                                    <Icon name="trash" className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                                <label className="offacto-quote-drop offacto-quote-drop-btn">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt,application/pdf"
                                        className="sr-only"
                                        disabled={!offer?.id || uploadingExtra}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                uploadSendAttachment(file);
                                            }
                                            e.target.value = '';
                                        }}
                                    />
                                    {uploadingExtra
                                        ? t('offers.block_document_uploading')
                                        : t('offers.builder_extra_attachment')}
                                </label>
                            </div>
                        </div>

                        <div className="offacto-quote-cta">
                            <AuthDiamond size={60} className="offacto-quote-cta-deco" />
                            <div className="offacto-quote-cta-copy">
                                <b>{t('offers.builder_cta_title')}</b>
                                <span>{t('offers.builder_cta_body')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {previewOpen ? (
                    <>
                        <button type="button" className="offacto-brief-scrim on" aria-label={t('common.close')} onClick={() => setPreviewOpen(false)} />
                        <div className="offacto-brief-modal offacto-quote-preview-modal on" role="dialog">
                            <div className="offacto-brief-edit-card-h">
                                <h3>{t('offers.preview_customer')}</h3>
                                <button type="button" className="offacto-brief-btn-sm" onClick={() => setPreviewOpen(false)}>
                                    <Icon name="x" />
                                </button>
                            </div>
                            <div className="offacto-brief-edit-card-b">
                                <div className="offacto-quote-preview-bar" style={{ background: brand }} />
                                {blocks
                                    .filter((b) => b.type === 'text')
                                    .map((b) => (
                                        <div key={b.clientKey} className="mb-4">
                                            {b.content?.heading ? <h2 className="offacto-quote-preview-h">{b.content.heading}</h2> : null}
                                            <p className="offacto-quote-hint">{b.content?.body}</p>
                                        </div>
                                    ))}
                                <OfferDocumentPreview
                                    template={normalizeInvoiceTemplate(activeCompany?.invoice_template)}
                                    number={offer?.offer_number || nextOfferNumber}
                                    date={form.data.offer_date}
                                    validUntil={form.data.valid_until}
                                    from={{ name: activeCompany?.company_name }}
                                    to={{ name: selectedCustomer?.org_name || '' }}
                                    items={items}
                                    vatRate={vatRate}
                                    theme={activeCompany?.theme}
                                    logoUrl={activeCompany?.invoice_logo_url}
                                />
                            </div>
                        </div>
                    </>
                ) : null}

                <SendOfferModal
                    open={sendOpen}
                    onClose={() => setSendOpen(false)}
                    offerId={offer?.id}
                    customerName={selectedCustomer?.org_name || selectedCustomer?.name || ''}
                    defaultEmail={selectedCustomer?.email || ''}
                    legalDocumentIds={selectedLegal}
                    attachmentCount={sendAttachmentCount}
                    postbodeConfigured={postbodeConfigured}
                    whatsappConfigured={whatsappConfigured}
                    whatsappShareUrl={whatsappShareUrl}
                    onBeforeSend={(runSend) => saveThen(runSend)}
                />
            </form>
        </AuthenticatedLayout>
    );
}
