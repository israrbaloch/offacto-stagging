import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import Icon from './Icon';
import { t } from '../lib/i18n';

function formatWhen(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return t('workspace.notifications.just_now');
    if (hours < 24) return t('workspace.notifications.hours_ago', { count: hours });
    const days = Math.floor(hours / 24);
    return t('workspace.notifications.days_ago', { count: days });
}

export default function TopBarNotifications({ open, onClose, anchorRef }) {
    const { workspaceShell } = usePage().props;
    const items = workspaceShell?.notifications ?? [];
    const popRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (event) => {
            if (
                popRef.current?.contains(event.target) ||
                anchorRef?.current?.contains(event.target)
            ) {
                return;
            }
            onClose();
        };
        document.addEventListener('mousedown', onPointer);
        return () => document.removeEventListener('mousedown', onPointer);
    }, [open, onClose, anchorRef]);

    if (!open) {
        return null;
    }

    return (
        <div ref={popRef} className="offacto-topbar-pop" role="dialog" aria-label={t('topbar.notifications')}>
            <div className="offacto-topbar-pop-head">
                <h3>{t('topbar.notifications')}</h3>
                <button
                    type="button"
                    className="offacto-topbar-pop-mark"
                    onClick={() => {
                        router.post('/notifications/read-all', {}, { preserveScroll: true });
                        onClose();
                    }}
                >
                    {t('workspace.notifications.mark_all_read')}
                </button>
            </div>
            <div className="offacto-topbar-pop-body">
                {items.length === 0 ? (
                    <p className="offacto-topbar-pop-empty">{t('workspace.notifications.empty')}</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="offacto-topbar-act">
                            <span className="offacto-topbar-act-icon">
                                <Icon name={item.icon || 'check'} className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                {item.href ? (
                                    <Link href={item.href} className="offacto-topbar-act-title" onClick={onClose}>
                                        {item.title}
                                    </Link>
                                ) : (
                                    <p className="offacto-topbar-act-title">{item.title}</p>
                                )}
                                {item.body ? <p className="offacto-topbar-act-body">{item.body}</p> : null}
                                <small>{formatWhen(item.at)}</small>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
