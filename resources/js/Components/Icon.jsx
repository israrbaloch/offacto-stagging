export default function Icon({ name, className = 'h-[18px] w-[18px]' }) {
    const props = {
        className,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '1.8',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        viewBox: '0 0 24 24',
        'aria-hidden': true,
    };

    const paths = {
        grid: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1.2" />
                <rect x="14" y="3" width="7" height="7" rx="1.2" />
                <rect x="3" y="14" width="7" height="7" rx="1.2" />
                <rect x="14" y="14" width="7" height="7" rx="1.2" />
            </>
        ),
        customers: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),
        building: (
            <>
                <path d="M3 21h18" />
                <path d="M5 21V7l7-4 7 4v14" />
                <path d="M9 21v-6h6v6" />
            </>
        ),
        clipboard: (
            <>
                <rect x="8" y="3" width="8" height="4" rx="1" />
                <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <path d="M9 12h6" />
                <path d="M9 16h4" />
            </>
        ),
        document: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 13h8" />
                <path d="M8 17h5" />
            </>
        ),
        invoice: (
            <>
                <path d="M4 2h16v20l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
            </>
        ),
        wrench: <path d="M14.7 6.3a4.1 4.1 0 0 0-5.8 5.6L3 18l3 3 5.9-5.9a4.1 4.1 0 0 0 5.6-5.8l-3.2 3.2-2.8-2.8z" />,
        help: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M9.6 9.4a2.4 2.4 0 1 1 3.7 2c-.8.5-1.3 1-1.3 1.8V14" />
                <circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none" />
            </>
        ),
        settings: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
            </>
        ),
        back: (
            <>
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
            </>
        ),
        chevron: <path d="m6 9 6 6 6-6" />,
        close: (
            <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
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
        chevronLeft: <path d="m15 18-6-6 6-6" />,
        chevronRight: <path d="m9 18 6-6-6-6" />,
        check: <path d="m5 13 4 4L19 7" />,
        user: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c1.5-3.2 4.4-5 8-5s6.5 1.8 8 5" />
            </>
        ),
        palette: (
            <>
                <path d="M12 3a9 9 0 1 0 0 18h1.2a2.2 2.2 0 0 0 0-4.4H12" />
                <circle cx="7.5" cy="10" r=".8" fill="currentColor" />
                <circle cx="10" cy="7" r=".8" fill="currentColor" />
                <circle cx="14" cy="7" r=".8" fill="currentColor" />
                <circle cx="16.5" cy="10" r=".8" fill="currentColor" />
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
        upload: (
            <>
                <path d="M12 16V6" />
                <path d="m8 9 4-4 4 4" />
                <path d="M4 18h16" />
            </>
        ),
        logout: (
            <>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
            </>
        ),
        trash: (
            <>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
            </>
        ),
    };

    return <svg {...props}>{paths[name]}</svg>;
}
