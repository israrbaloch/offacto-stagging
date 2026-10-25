/** Sync html.dark + data-theme with session appearance (offacto-app-demo.html). */
export function applyTheme(appearance) {
    const isDark = appearance === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
}
