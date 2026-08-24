let locale = 'en';
let translations = {};

export function setI18n(nextLocale, nextTranslations = {}) {
    locale = nextLocale || 'en';
    translations = nextTranslations || {};
}

export function currentLocale() {
    return locale;
}

export function t(key, replace = {}) {
    let text = translations[key] ?? key;
    Object.entries(replace).forEach(([name, value]) => {
        text = String(text).replaceAll(`:${name}`, String(value));
    });
    return text;
}

export function localeTag() {
    if (locale === 'fr') return 'fr-FR';
    if (locale === 'nl') return 'nl-NL';
    return 'en-GB';
}
