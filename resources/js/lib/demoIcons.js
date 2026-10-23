/**
 * SVG path data from offacto-app-demo.html (const I = { ... }).
 * Single source of truth for stroke icons across the app.
 */
export const DEMO_ICON_PATHS = {
    dash: ['M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z'],
    users: [
        'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
        'M9 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0',
        'M22 21v-2a4 4 0 0 0-3-3.87',
        'M16 3.13a4 4 0 0 1 0 7.75',
    ],
    file: [
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
        'M14 2v6h6',
        'M8 13h8',
        'M8 17h5',
    ],
    quote: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
    brief: [
        'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2',
        'M9 3h6v4H9z',
        'M9 14l2 2 4-4',
    ],
    clock: ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M12 7v5l3 2'],
    box: [
        'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
        'M3.3 7 12 12 21.3 7',
        'M12 22V12',
    ],
    cog: [
        'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
        'M12 2v3',
        'M12 19v3',
        'M4.2 4.2l2.1 2.1',
        'M17.7 17.7l2.1 2.1',
        'M2 12h3',
        'M19 12h3',
        'M4.2 19.8l2.1-2.1',
        'M17.7 6.3l2.1-2.1',
    ],
    plus: ['M12 5v14', 'M5 12h14'],
    search: ['M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0', 'M21 21l-4.3-4.3'],
    bell: [
        'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9',
        'M13.73 21a2 2 0 0 1-3.46 0',
    ],
    moon: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'],
    euro: [
        'M4 10h12',
        'M4 14h9',
        'M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2',
    ],
    alert: [
        'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
        'M12 9v4',
        'M12 17h.01',
    ],
    check: ['M20 6 9 17l-5-5'],
    send: ['M22 2 11 13', 'M22 2 2 9l10 2 10-9z'],
    back: ['M15 18l-6-6 6-6'],
    chev: ['M6 9l6 6 6-6'],
    x: ['M18 6 6 18', 'M6 6l12 12'],
    trash: [
        'M3 6h18',
        'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
        'M10 11v6',
        'M14 11v6',
        'M9 6V4h6v2',
    ],
    down: [
        'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
        'M7 10l5 5 5-5',
        'M12 15V3',
    ],
    up: [
        'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
        'M17 8l-5-5-5 5',
        'M12 3v12',
    ],
    play: ['M6 4l14 8-14 8z'],
    pause: ['M6 4h4v16H6z', 'M14 4h4v16h-4z'],
    menu: ['M3 6h18', 'M3 12h18', 'M3 18h18'],
    grip: [
        'M9 6a1 1 0 1 0 0 .01',
        'M15 6a1 1 0 1 0 0 .01',
        'M9 12a1 1 0 1 0 0 .01',
        'M15 12a1 1 0 1 0 0 .01',
        'M9 18a1 1 0 1 0 0 .01',
        'M15 18a1 1 0 1 0 0 .01',
    ],
    link: [
        'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
        'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
    ],
    build: [
        'M3 21h18',
        'M5 21V7l8-4v18',
        'M19 21V11l-6-4',
        'M9 9h.01',
        'M9 12h.01',
        'M9 15h.01',
        'M9 18h.01',
    ],
    spark: [
        'M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z',
        'M19 17l.7 2.1L22 20l-2.3.9L19 23l-.7-2.1L16 20l2.3-.9z',
    ],
    logout: [
        'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
        'M16 17l5-5-5-5',
        'M21 12H9',
    ],
    text: ['M4 7V4h16v3', 'M9 20h6', 'M12 4v16'],
    img: [
        'M3 3h18v18H3z',
        'M8.5 8.5a1.5 1.5 0 1 0 0 .01',
        'M21 15l-5-5L5 21',
    ],
    video: ['M2 5h14v14H2z', 'M22 8l-6 4 6 4z'],
    table: ['M3 3h18v18H3z', 'M3 9h18', 'M3 15h18', 'M9 3v18'],
    sign: [
        'M3 17c3-3 4-9 7-9s-1 8 2 8 3-4 5-4 2 3 4 3',
        'M3 21h18',
    ],
    mic: [
        'M9 2h6v12a3 3 0 0 1-6 0V2z',
        'M5 10a7 7 0 0 0 14 0',
        'M12 17v5',
    ],
    clip: [
        'M21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48',
    ],
    inbox: [
        'M22 12h-6l-2 3h-4l-2-3H2',
        'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    ],
    chat: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
    shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
    map: ['M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z', 'M8 2v16', 'M16 6v16'],
    globe: [
        'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0',
        'M2 12h20',
        'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    ],
    eye: [
        'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z',
        'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
    ],
    repeat: [
        'M17 1l4 4-4 4',
        'M3 11V9a4 4 0 0 1 4-4h14',
        'M7 23l-4-4 4-4',
        'M21 13v2a4 4 0 0 1-4 4H3',
    ],
    minus: ['M5 12h14'],
    lock: ['M3 11h18v11H3z', 'M7 11V7a5 5 0 0 1 10 0v4'],
    mail: ['M2 4h20v16H2z', 'M22 6 12 13 2 6'],
    copy: ['M9 9h13v13H9z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
    flag: ['M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z', 'M4 22v-7'],
    road: ['M4 19 8 5', 'M20 19 16 5', 'M12 6v2', 'M12 11v2', 'M12 16v2'],
};

/** App icon names → demo `I` keys */
export const DEMO_ICON_ALIASES = {
    grid: 'dash',
    customers: 'users',
    document: 'file',
    upload: 'up',
    settings: 'cog',
    close: 'x',
    chevron: 'chev',
    chevronLeft: 'back',
    chevronRight: 'chev',
    building: 'build',
    clipboard: 'brief',
    wrench: 'cog',
    offers: 'quote',
    services: 'box',
    help: 'alert',
    download: 'down',
};

export function resolveDemoIconName(name) {
    if (!name) {
        return null;
    }
    if (DEMO_ICON_PATHS[name]) {
        return name;
    }
    return DEMO_ICON_ALIASES[name] ?? null;
}

export function getDemoIconPaths(name) {
    const key = resolveDemoIconName(name);
    return key ? DEMO_ICON_PATHS[key] : null;
}
