import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { t } from '../lib/i18n';

export default function SidebarCreateMenu({ disabled = false }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointer);
        return () => document.removeEventListener('mousedown', onPointer);
    }, [open]);

    if (disabled) {
        return null;
    }

    const items = [
        { href: '/invoices/create', label: t('nav.invoices'), icon: 'document' },
        { href: '/offers/create', label: t('sidebar.create_quote'), icon: 'offers' },
        { href: '/briefings/create', label: t('sidebar.create_briefing'), icon: 'clipboard' },
        { href: '/customers/create', label: t('sidebar.create_customer'), icon: 'customers' },
    ];

    return (
        <div ref={rootRef} className="relative z-50 mb-1">
            <button
                type="button"
                className="offacto-sidebar-create"
                aria-expanded={open}
                onClick={(event) => {
                    event.stopPropagation();
                    setOpen((value) => !value);
                }}
            >
                <Icon name="plus" className="icon-ring h-[28px] w-[28px]" />
                {t('nav.create')}
            </button>
            <div className={`offacto-plusmenu ${open ? 'on' : ''}`} role="menu">
                {items.map((item) => (
                    <Link key={item.href} href={item.href} role="menuitem" onClick={() => setOpen(false)}>
                        <Icon name={item.icon} className="h-[18px] w-[18px]" />
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
