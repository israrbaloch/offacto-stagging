import Icon from './Icon';
import { t } from '../lib/i18n';

export default function SidebarCollapseButton({ collapsed, onToggle }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            title={collapsed ? t('nav.expand_sidebar') : t('nav.collapse_sidebar')}
            className={`flex w-full items-center rounded-xl py-2 text-slate-600 transition hover:bg-white/60 hover:text-slate-900 ${
                collapsed ? 'justify-center px-0' : 'gap-2 px-3'
            }`}
        >
            <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} className="h-[17px] w-[17px] shrink-0 opacity-80" />
            {!collapsed && <span className="truncate text-[13px]">{t('nav.collapse_sidebar')}</span>}
        </button>
    );
}
