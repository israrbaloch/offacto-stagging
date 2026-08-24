import { router, usePage } from '@inertiajs/react';
import SelectMenu from './SelectMenu';

export default function CompanySwitcher() {
    const { companies, activeCompany } = usePage().props;

    if (!companies?.length) return null;

    return (
        <SelectMenu
            className="w-full rounded-lg border-0 bg-white/80 px-3 py-2 text-xs text-slate-600 outline-none"
            value={activeCompany?.id || ''}
            searchable={companies.length > 6}
            allowEmpty={false}
            placeholder="Select company"
            options={companies.map((company) => ({ value: company.id, label: company.company_name }))}
            onChange={(e) => {
                if (!e.target.value) return;
                router.post(`/company/switch/${e.target.value}`);
            }}
        />
    );
}
