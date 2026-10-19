import { router, usePage } from '@inertiajs/react';
import { selectClass } from './ui';

/** Single control to jump between settings sections — no second sidebar. */
export default function SettingsSectionNav({ nav = [], activeId, basePath = '/admin/settings' }) {
    const { url } = usePage();
    if (!nav.length) return null;

    const grouped = nav.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
    }, {});

    return (
        <div className="border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-sm lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
                <label className="flex min-w-[200px] flex-1 items-center gap-2 text-sm text-slate-600 sm:max-w-md">
                    <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">Section</span>
                    <select
                        className={selectClass}
                        value={
                            nav.find((item) => item.id === activeId)?.href ||
                            (activeId ? `${basePath}/${activeId}` : '')
                        }
                        onChange={(e) => {
                            const href = e.target.value;
                            if (href && href !== url.split('?')[0]) {
                                router.visit(href);
                            }
                        }}
                    >
                        {Object.entries(grouped).map(([group, items]) => (
                            <optgroup key={group} label={group}>
                                {items.map((item) => (
                                    <option key={item.id} value={item.href || `${basePath}/${item.id}`}>
                                        {item.title}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </label>
                <p className="text-xs text-slate-500">Use the overview page to browse all settings by category.</p>
            </div>
        </div>
    );
}
