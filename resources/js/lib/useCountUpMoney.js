import { useEffect, useState } from 'react';
import { money } from './utils';

/**
 * Animate a euro amount from 0 → target (offacto-app-demo.html countUp + data-count).
 */
export function useCountUpMoney(target, { duration = 700 } = {}) {
    const to = Number(target || 0);
    const [display, setDisplay] = useState(() => money(0));

    useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDisplay(money(to));
            return undefined;
        }

        const start = performance.now();
        let frame = 0;

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            setDisplay(money(to * eased));
            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        setDisplay(money(0));
        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [to, duration]);

    return display;
}
