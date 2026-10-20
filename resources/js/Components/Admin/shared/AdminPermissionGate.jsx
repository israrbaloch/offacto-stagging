import { usePage } from '@inertiajs/react';

/** SH-016 — hide or disable actions based on admin role / permission keys. */
export default function AdminPermissionGate({ requireAdmin = true, permissions = [], fallback = null, children, mode = 'hide' }) {
    const { auth } = usePage().props;
    const granted = auth?.user?.permissions || [];
    const isAdmin = auth?.user?.is_admin;

    let allowed = true;
    if (requireAdmin && !isAdmin && granted.length === 0) allowed = false;
    if (permissions.length && !permissions.every((p) => granted.includes(p))) {
        allowed = false;
    }

    if (allowed) return children;

    if (mode === 'disable' && children) {
        return <span className="inline-block opacity-50 pointer-events-none" title="Insufficient permissions">{children}</span>;
    }

    return fallback;
}
