import { AdminField } from './ui';

const PLATFORM_ROLE_NAMES = new Set([
    'admin',
    'admin_support',
    'admin_billing',
    'admin_compliance',
    'admin_security',
    'admin_settings',
    'admin_governance',
]);

export function isPlatformRoleName(name) {
    return PLATFORM_ROLE_NAMES.has(name);
}

export default function PlatformAccessFields({
    platformAccess,
    onPlatformAccessChange,
    adminPermissions = [],
    onAdminPermissionsChange,
    adminCapabilities = [],
    presets = {},
    errors = {},
}) {
    const togglePermission = (key) => {
        if (adminPermissions.includes(key)) {
            onAdminPermissionsChange(adminPermissions.filter((value) => value !== key));
        } else {
            onAdminPermissionsChange([...adminPermissions, key]);
        }
    };

    const applyPreset = (presetKey) => {
        const preset = presets[presetKey];
        if (!preset?.permissions) return;
        onPlatformAccessChange('specialist');
        onAdminPermissionsChange([...preset.permissions]);
    };

    return (
        <div className="space-y-4">
            <AdminField label="Platform admin access">
                <div className="space-y-2 text-sm">
                    <label className="flex items-start gap-2">
                        <input
                            type="radio"
                            name="platform_access"
                            checked={platformAccess === 'none'}
                            onChange={() => onPlatformAccessChange('none')}
                        />
                        <span>
                            <span className="font-medium text-slate-800">No platform admin</span>
                            <span className="mt-0.5 block text-xs text-slate-500">Company workspace only (if given a staff role).</span>
                        </span>
                    </label>
                    <label className="flex items-start gap-2">
                        <input
                            type="radio"
                            name="platform_access"
                            checked={platformAccess === 'specialist'}
                            onChange={() => onPlatformAccessChange('specialist')}
                        />
                        <span>
                            <span className="font-medium text-slate-800">Specialist</span>
                            <span className="mt-0.5 block text-xs text-slate-500">Limited areas (Support, Billing, Security, etc.).</span>
                        </span>
                    </label>
                    <label className="flex items-start gap-2">
                        <input
                            type="radio"
                            name="platform_access"
                            checked={platformAccess === 'full'}
                            onChange={() => onPlatformAccessChange('full')}
                        />
                        <span>
                            <span className="font-medium text-slate-800">Full platform admin</span>
                            <span className="mt-0.5 block text-xs text-slate-500">All settings and destructive operations.</span>
                        </span>
                    </label>
                </div>
            </AdminField>

            {platformAccess === 'specialist' && (
                <>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(presets).map(([key, preset]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => applyPreset(key)}
                                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-100"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    <AdminField label="Platform areas" error={errors.admin_permissions}>
                        <div className="space-y-2">
                            {adminCapabilities.map((cap) => (
                                <label key={cap.key} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={adminPermissions.includes(cap.key)}
                                        onChange={() => togglePermission(cap.key)}
                                        className="mt-0.5 rounded border-slate-300 text-indigo-600"
                                    />
                                    <span>
                                        <span className="font-medium text-slate-800">{cap.label}</span>
                                        <span className="mt-0.5 block text-xs text-slate-500">{cap.description}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </AdminField>
                </>
            )}

            {errors.platform_access && <p className="text-xs text-rose-600">{errors.platform_access}</p>}
        </div>
    );
}
