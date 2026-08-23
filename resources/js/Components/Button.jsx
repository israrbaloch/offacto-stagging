import { Link } from '@inertiajs/react';

const variants = {
    primary: 'bg-[var(--company-primary)] text-white hover:opacity-90',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
};

export default function Button({
    as = 'button',
    href,
    variant = 'primary',
    className = '',
    children,
    ...props
}) {
    const classes = `inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`;

    if (href && as === 'a') {
        return (
            <a href={href} className={classes} {...props}>
                {children}
            </a>
        );
    }

    if (href) {
        return (
            <Link href={href} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}
