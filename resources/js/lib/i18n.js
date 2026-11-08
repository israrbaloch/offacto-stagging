import en from '../../../lang/en.json';

let locale = 'en';
let translations = {};
let fallback = en;

export function setI18n(nextLocale, nextTranslations = {}, nextFallback = null) {
    locale = nextLocale || 'en';
    translations = nextTranslations || {};
    if (nextFallback && typeof nextFallback === 'object') {
        fallback = nextFallback;
    }
}

export function currentLocale() {
    return locale;
}

export function t(key, replace = {}) {
    const translated = translations[key];
    let text = translated != null && translated !== '' ? translated : (fallback[key] ?? key);
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
