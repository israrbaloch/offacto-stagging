import { Head, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import FlashToaster from '../Components/FlashToaster';
import FormErrorsToaster from '../Components/FormErrorsToaster';
import I18nSync from '../Components/I18nSync';
import Icon from '../Components/Icon';
import LocaleSelect from '../Components/LocaleSelect';
import { t } from '../lib/i18n';

const AUTH_MARK_SRC = '/assets/images/favicon.ico';

/** Diamond mark only (demo uses favicon-sized icon + “Offacto” word, not the full wordmark SVG). */
export function AuthMark({ size = 34, className = '' }) {
    const dimension = `${size}px`;

    return (
        <img
            src={AUTH_MARK_SRC}
            alt=""
            className={`shrink-0 object-contain ${className}`}
            width={size}
            height={size}
            style={{ width: dimension, height: dimension }}
        />
    );
}

export function AuthDiamond({ size, delay = '0s', className = '' }) {
    return (
        <span
            aria-hidden="true"
            className={`auth-diamond pointer-events-none absolute border-current ${className}`}
            style={{
                width: size,
                height: size,
                borderWidth: size > 80 ? 10 : 6,
                animationDelay: delay,
            }}
        />
    );
}

function ShieldIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

/** @deprecated Use authInputClass */
export const inputClass = (error) => authInputClass(error);

export const authInputClass = (error) =>
    `auth-field w-full min-h-[46px] rounded-[14px] px-4 transition ${
        error ? '!border-rose-400' : ''
    }`;

export const authPrimaryButtonClass =
    'flex w-full items-center justify-center gap-2 rounded-full bg-[#6B59DC] py-3 text-[14.5px] font-semibold text-white transition hover:bg-[#5A48C8] disabled:opacity-50';

/** Demo auth register “Next / Start trial” (v9: .auth-form .btn.dark → #6B59DC, white text). */
export const authRegisterNextButtonClass = 'auth-register-cta';

/** Demo auth register row “Back” (.btn ghost pill, not full width). */
export const authRegisterBackButtonClass =
    'inline-flex shrink-0 items-center justify-center rounded-full border border-[rgba(14,18,80,0.1)] bg-white px-8 py-3 text-[14.5px] font-semibold text-[#0E1250] transition hover:border-[#6B59DC] hover:text-[#6B59DC] dark:border-white/15 dark:bg-[#1E2466] dark:text-[#E8ECFF] dark:hover:border-[#9D8DF1] dark:hover:text-white';

/** Compact outline pill (lookup, upload) on register steps. */
export const authRegisterOutlineButtonClass =
    'inline-flex shrink-0 items-center justify-center rounded-full border border-[rgba(14,18,80,0.1)] bg-white px-5 py-3 text-[14.5px] font-semibold text-[#0E1250] transition hover:border-[#6B59DC] hover:text-[#6B59DC] dark:border-white/15 dark:bg-[#1E2466] dark:text-[#E8ECFF]';

export const authSecondaryButtonClass =
    'flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(14,18,80,0.1)] bg-white py-3 text-sm font-semibold text-[#0E1250] transition hover:border-[#6B59DC] hover:text-[#6B59DC] dark:border-white/15 dark:bg-[#1E2466] dark:text-[#E8ECFF] dark:hover:border-[#9D8DF1] dark:hover:text-white';

/** Demo auth: white pill on form panel (same in light and dark). */
export const authGoogleButtonClass =
    'auth-google-btn flex w-full items-center justify-center rounded-full border border-[rgba(14,18,80,0.1)] py-3 text-[14.5px] font-semibold text-[#0E1250] transition hover:border-[#6B59DC] hover:text-[#6B59DC]';

export const authLabelClass = 'mb-1.5 block text-[13px] font-semibold leading-normal text-[#0E1250] dark:text-[#E8ECFF]';

export const authMutedClass = 'text-[14.5px] leading-normal text-[#48537F] dark:text-[#A1A9DD]';

export const authSubClass = `mt-1.5 mb-[26px] ${authMutedClass}`;

export const authHeadingClass =
    'font-[Urbanist,system-ui,sans-serif] text-[28px] font-extrabold tracking-[-0.02em] text-[#0E1250] dark:text-[#E8ECFF]';

export const authLinkClass = 'font-semibold text-[#5A48C8] hover:text-[#6B59DC] dark:text-[#C4BBFF]';

export const authOtpInputClass = (error) =>
    `auth-field auth-otp-cell flex-1 min-w-0 text-center text-lg font-semibold tabular-nums ${error ? '!border-rose-400' : ''}`;

/** Favicon mark + word on narrow viewports (demo auth-form branding). */
export function AuthFormMobileBrand({ showFormLogo = false }) {
    if (showFormLogo) {
        return <AuthMark size={38} className="mb-[28px] lg:hidden" />;
    }

    return (
        <div className="mb-7 flex items-center gap-2.5 lg:hidden">
            <AuthMark size={38} />
            <span className="font-[Urbanist,system-ui,sans-serif] text-[22px] font-extrabold tracking-[-0.02em] text-[#0E1250] dark:text-[#E8ECFF]">
                Offacto
            </span>
        </div>
    );
}

function AuthThemeToggle() {
    const { appearance } = usePage().props;
    const isDark = appearance === 'dark';

    return (
        <button
            type="button"
            className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border border-[rgba(14,18,80,0.08)] bg-white text-[#48537F] transition hover:border-[#9D8DF1] hover:text-[#6B59DC] dark:border-white/10 dark:bg-[#161B55] dark:text-[#C8CEF0] dark:hover:text-white"
            aria-label={isDark ? t('theme.to_light') : t('theme.to_dark')}
            title={isDark ? t('theme.light') : t('theme.dark')}
            onClick={() => {
                const next = isDark ? 'light' : 'dark';
                router.post('/theme', { theme: next }, { preserveScroll: true, preserveState: true });
            }}
        >
            <Icon name={isDark ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
        </button>
    );
}

export function AuthOrDivider() {
    return (
        <div className="my-1 flex items-center gap-2.5 text-[12px] text-[#48537F] dark:text-[#A1A9DD]">
            <span className="h-px flex-1 bg-[rgba(14,18,80,0.08)] dark:bg-white/10" aria-hidden="true" />
            {t('auth.or')}
            <span className="h-px flex-1 bg-[rgba(14,18,80,0.08)] dark:bg-white/10" aria-hidden="true" />
        </div>
    );
}

export default function AuthSplitLayout({ title, children, showFormLogo = false, formMaxWidth = 'full' }) {
    const { appearance } = usePage().props;
    const headlineTail = t('auth.panel_headline_tail');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', appearance === 'dark');
    }, [appearance]);

    return (
        <div className="auth-shell relative grid min-h-screen place-items-center overflow-x-hidden bg-[#C9D7F2] font-[Figtree,system-ui,sans-serif] text-[14.5px] leading-normal text-[#0E1250] dark:bg-[#0B0E3A] dark:text-[#E8ECFF]">
            <I18nSync />
            <Head title={title}>
                <link rel="icon" href={AUTH_MARK_SRC} sizes="any" />
            </Head>
            <FlashToaster />
            <FormErrorsToaster />

            <AuthDiamond size={120} className="left-[4%] top-[10%] text-[rgba(107,125,196,0.18)]" />
            <AuthDiamond size={60} delay="2s" className="right-[6%] bottom-[12%] text-[rgba(107,125,196,0.22)]" />

            <div className="absolute right-5 top-4 z-20 flex items-center gap-2">
                <AuthThemeToggle />
                <LocaleSelect variant="segmented" />
            </div>

            <div className="auth-box relative z-10 grid w-full min-h-[620px] max-w-[1080px] overflow-hidden rounded-[32px] bg-[#E7EDFB] shadow-[0_18px_40px_rgba(14,18,80,0.16)] dark:bg-[#161B55] lg:grid-cols-2">
                <aside className="auth-art relative hidden flex-col justify-between overflow-hidden bg-[#0E1250] p-12 text-white lg:flex">
                    <AuthDiamond size={180} className="-right-10 top-16 text-[rgba(157,141,241,0.16)]" />
                    <AuthDiamond size={90} delay="2s" className="right-36 top-64 text-[rgba(157,141,241,0.16)]" />
                    <AuthDiamond size={260} delay="1s" className="-bottom-16 -left-24 text-[rgba(157,141,241,0.12)]" />
                    <AuthDiamond size={50} delay="3s" className="bottom-28 left-[60%] text-[rgba(157,141,241,0.2)]" />

                    <div className="relative z-10 flex items-center gap-2.5">
                        <AuthMark size={34} />
                        <span className="font-[Urbanist,system-ui,sans-serif] text-[22px] font-extrabold tracking-[-0.02em] text-white">
                            Offacto
                        </span>
                    </div>

                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold">
                            <ShieldIcon />
                            {t('auth.panel_chip')}
                        </span>
                        <h1 className="mt-5 max-w-[420px] font-[Urbanist,system-ui,sans-serif] text-[42px] font-extrabold leading-[1.12] tracking-[-0.02em] text-white">
                            {t('auth.panel_headline_lead')}{' '}
                            <span className="text-[#B4A9FF]">{t('auth.panel_headline_accent')}</span>
                            {headlineTail ? ` ${headlineTail}` : null}
                        </h1>
                        <p className="mt-3.5 max-w-[400px] text-[15px] leading-relaxed text-white/80">{t('auth.panel_body')}</p>
                        <ul className="mt-[26px] grid gap-3 text-[15px] font-medium">
                            {['auth.panel_point_1', 'auth.panel_point_2', 'auth.panel_point_3'].map((item) => (
                                <li key={item} className="flex items-center gap-2.5">
                                    <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-lg bg-[#6B59DC]">
                                        <CheckIcon />
                                    </span>
                                    {t(item)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="relative z-10 text-xs text-white/60">{t('auth.panel_copyright')}</p>
                </aside>

                <section className="auth-form flex flex-col justify-center bg-[#E7EDFB] p-12 text-[#0E1250] dark:bg-[#161B55] dark:text-[#E8ECFF]">
                    <div className={`w-full ${formMaxWidth === 'lg' ? 'max-w-lg' : ''}`}>
                        <AuthFormMobileBrand showFormLogo={showFormLogo} />
                        {children}
                    </div>
                </section>
            </div>
        </div>
    );
}
