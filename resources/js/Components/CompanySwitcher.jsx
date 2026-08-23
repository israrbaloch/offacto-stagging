import { router, usePage } from '@inertiajs/react';

export default function CompanySwitcher() {
    const { companies, activeCompany } = usePage().props;

    if (!companies?.length) return null;

    return (
        <select
            className="w-full rounded-lg border-0 bg-white/80 px-3 py-2 text-xs text-slate-600 outline-none"
            value={activeCompany?.id || ''}
            onChange={(e) => {
                if (!e.target.value) return;
                router.post(`/company/switch/${e.target.value}`);
            }}
        >
            {companies.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.company_name}
                </option>
            ))}
        </select>
    );
}
