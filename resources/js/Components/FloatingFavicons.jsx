import { useMemo } from 'react';

const ICONS = ['/assets/images/favicon.ico', '/assets/images/favicon2.ico'];

function unit(index, salt) {
    const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
}

export default function FloatingFavicons({ count = 10, minSize = 28, maxSize = 110 }) {
    const items = useMemo(() => {
        const cols = Math.ceil(Math.sqrt(count * 1.15));
        const rows = Math.ceil(count / cols);

        return Array.from({ length: count }, (_, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const step = count === 1 ? 0 : index / (count - 1);
            const size = Math.round(maxSize - step * (maxSize - minSize));
            const jitterX = (unit(index, 2) - 0.5) * (70 / cols);
            const jitterY = (unit(index, 3) - 0.5) * (70 / rows);
            const cellLeft = ((col + 0.5) / cols) * 88 + 4;
            const cellTop = ((row + 0.5) / rows) * 88 + 4;

            return {
                src: ICONS[index % ICONS.length],
                size,
                left: `${Math.min(90, Math.max(2, cellLeft + jitterX))}%`,
                top: `${Math.min(90, Math.max(2, cellTop + jitterY))}%`,
                duration: `${20 + Math.round(unit(index, 4) * 18)}s`,
                x: `${Math.round((unit(index, 5) - 0.5) * 22)}px`,
                y: `${Math.round((unit(index, 6) - 0.5) * 22)}px`,
                delay: `-${Math.round(unit(index, 7) * 16)}s`,
                opacity: 0.22 + unit(index, 8) * 0.28,
            };
        });
    }, [count, minSize, maxSize]);

    return (
        <>
            {items.map((item, index) => (
                <img
                    key={`${item.src}-${index}`}
                    src={item.src}
                    alt=""
                    aria-hidden="true"
                    className="register-orb pointer-events-none absolute select-none object-contain"
                    style={{
                        width: item.size,
                        height: item.size,
                        left: item.left,
                        top: item.top,
                        opacity: item.opacity,
                        '--float-duration': item.duration,
                        '--float-x': item.x,
                        '--float-y': item.y,
                        animationDelay: item.delay,
                    }}
                />
            ))}
        </>
    );
}
