import '../css/app.css';
import '../css/admin-shell.css';
import './bootstrap';
import { createInertiaApp, router, usePage } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { UiProvider } from './context/UiContext';
import { applyTheme } from './lib/applyTheme';
import { setI18n } from './lib/i18n';

createInertiaApp({
    title: (title) => (title ? `${title} — Offacto` : 'Offacto'),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];
        if (!page) {
            throw new Error(`Inertia page not found: ${name}`);
        }

        const Page = page.default;

        function LocalizedPage(props) {
            const { locale, translations } = usePage().props;
            setI18n(locale, translations);

            return <Page {...props} />;
        }

        LocalizedPage.layout = Page.layout;

        return { default: LocalizedPage };
    },
    setup({ el, App, props }) {
        setI18n(props.initialPage?.props?.locale, props.initialPage?.props?.translations);
        applyTheme(props.initialPage?.props?.appearance ?? 'light');

        router.on('success', (event) => {
            const pageProps = event.detail.page?.props;
            if (pageProps) {
                setI18n(pageProps.locale, pageProps.translations);
            }
            const next = pageProps?.appearance;
            if (next != null) {
                applyTheme(next);
            }
        });

        createRoot(el).render(
            <UiProvider>
                <App {...props} />
            </UiProvider>,
        );
    },
    progress: {
        color: '#4054b2',
    },
});
