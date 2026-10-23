import { DEMO_ICON_ALIASES, DEMO_ICON_PATHS } from '../lib/demoIcons';

const svgProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: '0 0 24 24',
    'aria-hidden': true,
};

/** Demo icons that need circle/rect in addition to paths (exact from offacto-app-demo.html). */
const DEMO_SHAPES = {
    users: (
        <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
        </>
    ),
    cog: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </>
    ),
    globe: (
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </>
    ),
    eye: (
        <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    img: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
        </>
    ),
    video: (
        <>
            <rect x="2" y="5" width="14" height="14" rx="2" />
            <path d="m22 8-6 4 6 4z" />
        </>
    ),
    table: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M3 15h18M9 3v18" />
        </>
    ),
    lock: (
        <>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
    ),
    mail: (
        <>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 6-10 7L2 6" />
        </>
    ),
    copy: (
        <>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </>
    ),
    mic: (
        <>
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0M12 17v5" />
        </>
    ),
    send: (
        <>
            <path d="m22 2-7 20-4-9-9-4z" />
            <path d="M22 2 11 13" />
        </>
    ),
};

/** Icons not in the demo pack (app-specific). */
const APP_ONLY_ICONS = {
    invoice: (
        <>
            <path d="M4 2h16v20l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
            <path d="M8 8h8" />
            <path d="M8 12h8" />
            <path d="M8 16h5" />
        </>
    ),
    palette: (
        <>
            <path d="M12 3a9 9 0 1 0 0 18h1.2a2.2 2.2 0 0 0 0-4.4H12" />
            <circle cx="7.5" cy="10" r=".8" fill="currentColor" stroke="none" />
            <circle cx="10" cy="7" r=".8" fill="currentColor" stroke="none" />
            <circle cx="14" cy="7" r=".8" fill="currentColor" stroke="none" />
            <circle cx="16.5" cy="10" r=".8" fill="currentColor" stroke="none" />
        </>
    ),
    calendar: (
        <>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18" />
            <path d="M8 3v4" />
            <path d="M16 3v4" />
        </>
    ),
    scale: (
        <>
            <path d="M12 3v18" />
            <path d="M5 8h14" />
            <path d="M5 8 2 14h6L5 8z" />
            <path d="M19 8l-3 6h6l-3-6z" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c1.5-3.2 4.4-5 8-5s6.5 1.8 8 5" />
        </>
    ),
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </>
    ),
    'dots-vertical': (
        <>
            <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
        </>
    ),
    peppol: <path d="M4 6h16v12H4zM8 10h8M8 14h5" />,
    whatsapp: (
        <path d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2z" />
    ),
};

function resolveKey(name) {
    if (DEMO_ICON_PATHS[name] || DEMO_SHAPES[name]) {
        return name;
    }
    return DEMO_ICON_ALIASES[name] ?? null;
}

export default function Icon({ name, className = 'h-[18px] w-[18px]' }) {
    const demoKey = resolveKey(name);
    const appOnly = APP_ONLY_ICONS[name];

    let content = appOnly;
    if (!content && demoKey) {
        if (DEMO_SHAPES[demoKey]) {
            content = DEMO_SHAPES[demoKey];
        } else {
            const paths = DEMO_ICON_PATHS[demoKey];
            content = paths?.map((d, index) => <path key={index} d={d} />);
        }
    }

    if (!content) {
        return null;
    }

    return (
        <svg {...svgProps} className={className}>
            {content}
        </svg>
    );
}
