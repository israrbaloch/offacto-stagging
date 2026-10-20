import { useCallback, useEffect, useState } from 'react';

export function useSidebarCollapsed(storageKey) {
    const [collapsed, setCollapsedState] = useState(false);

    useEffect(() => {
        try {
            setCollapsedState(localStorage.getItem(storageKey) === '1');
        } catch {
            // ignore
        }
    }, [storageKey]);

    const setCollapsed = useCallback(
        (value) => {
            setCollapsedState(value);
            try {
                localStorage.setItem(storageKey, value ? '1' : '0');
            } catch {
                // ignore
            }
        },
        [storageKey],
    );

    const toggle = useCallback(() => {
        setCollapsedState((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(storageKey, next ? '1' : '0');
            } catch {
                // ignore
            }
            return next;
        });
    }, [storageKey]);

    return { collapsed, setCollapsed, toggle };
}
