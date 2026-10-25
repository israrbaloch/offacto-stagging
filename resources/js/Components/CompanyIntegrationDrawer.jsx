import Icon from './Icon';
import { t } from '../lib/i18n';

export default function CompanyIntegrationDrawer({ open, integration, onClose, children, footer }) {
    if (!integration) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                className={`offacto-drawer-scrim${open ? ' on' : ''}`}
                aria-label={t('common.close')}
                aria-hidden={!open}
                tabIndex={open ? 0 : -1}
                onClick={onClose}
            />
            <aside
                className={`offacto-drawer offacto-integration-drawer${open ? ' on' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!open}
                aria-labelledby="integration-drawer-title"
            >
                <div className="offacto-drawer-head">
                    <div className="offacto-drawer-who">
                        <span className={`offacto-settings-integ-mark offacto-settings-integ-mark--${integration.markTone}`}>
                            {integration.mark}
                        </span>
                        <div>
                            <h3 id="integration-drawer-title">{t(integration.titleKey)}</h3>
                            <small>{t(integration.descKey)}</small>
                        </div>
                    </div>
                    <button type="button" className="offacto-drawer-close" onClick={onClose} aria-label={t('common.close')}>
                        <Icon name="x" />
                    </button>
                </div>
                <div className="offacto-drawer-body offacto-integration-drawer-body">{children}</div>
                {footer ? <div className="offacto-drawer-foot">{footer}</div> : null}
            </aside>
        </>
    );
}
