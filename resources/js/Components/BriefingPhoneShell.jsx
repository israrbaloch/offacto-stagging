import Icon from './Icon';
import { previewUrlLabel } from '../lib/briefingPreviewTotal';
import { t } from '../lib/i18n';

function BriefingFormHeader({ urlLabel, companyLogoUrl, companyName, title, showUrl = true }) {
    return (
        <div className="offacto-brief-phone-h">
            {showUrl ? <span className="offacto-brief-phone-url">{urlLabel}</span> : null}
            <div className="offacto-brief-phone-brand">
                {companyLogoUrl ? (
                    <img src={companyLogoUrl} alt="" className="offacto-brief-phone-logo" />
                ) : null}
                <b>{companyName || t('briefings.company_fallback')}</b>
            </div>
            <div className="offacto-brief-phone-title">{title || t('briefings.untitled')}</div>
        </div>
    );
}

/**
 * @param {'phone'|'web'} layout — phone = builder mockup; web = full public briefing page
 */
export default function BriefingPhoneShell({
    layout = 'phone',
    shareUrl,
    companyName,
    companyLogoUrl,
    title,
    badge,
    children,
}) {
    const urlLabel = previewUrlLabel(
        shareUrl ?? (typeof window !== 'undefined' ? window.location.href : ''),
    );

    const header = (
        <BriefingFormHeader
            urlLabel={urlLabel}
            companyLogoUrl={companyLogoUrl}
            companyName={companyName}
            title={title}
            showUrl={layout === 'phone'}
        />
    );

    if (layout === 'web') {
        return (
            <div className="offacto-brief-public-web-wrap">
                <div className="offacto-brief-web offacto-brief-form-surface">
                    {header}
                    <div className="offacto-brief-phone-b">{children}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={badge ? 'offacto-brief-edit-sticky' : 'offacto-brief-public-phone-wrap'}>
            {badge ? <div className="offacto-brief-edit-preview-label">{badge}</div> : null}
            <div className="offacto-brief-phone offacto-brief-form-surface">
                {header}
                <div className="offacto-brief-phone-b">{children}</div>
            </div>
        </div>
    );
}

export function BriefingPhoneBadge() {
    return (
        <span className="offacto-status-badge nd">
            <Icon name="eye" />
            {t('briefings.live_preview')}
        </span>
    );
}
