import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { setI18n } from './lib/i18n';

createInertiaApp({
    title: (title) => (title ? `${title} — Offacto` : 'Offacto'),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];
        if (!page) {
            throw new Error(`Inertia page not found: ${name}`);
        }
        return page;
    },
    setup({ el, App, props }) {
        setI18n(props.initialPage?.props?.locale, props.initialPage?.props?.translations);
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#4054b2',
    },
});
