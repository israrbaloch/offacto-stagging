import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import Logo from '../Components/Logo';
import Toast from '../Components/Toast';

const orbs = [
    { className: '-left-20 top-8 h-56 w-56 bg-indigo-200/45', duration: '32s', x: '22px', y: '-28px', delay: '0s' },
    { className: '-right-16 top-28 h-72 w-72 bg-violet-200/50', duration: '38s', x: '-26px', y: '20px', delay: '-8s' },
    { className: 'left-16 bottom-10 h-40 w-40 bg-indigo-300/30', duration: '26s', x: '16px', y: '24px', delay: '-4s' },
    { className: 'right-10 bottom-32 h-24 w-24 bg-fuchsia-200/40', duration: '22s', x: '-14px', y: '-18px', delay: '-12s' },
    { className: 'left-1/2 top-1/3 h-16 w-16 bg-sky-200/50', duration: '20s', x: '20px', y: '12px', delay: '-2s' },
    { className: 'left-8 top-1/2 h-10 w-10 bg-violet-300/35', duration: '18s', x: '-10px', y: '16px', delay: '-6s' },
    { className: 'right-1/3 top-12 h-14 w-14 bg-indigo-100/80', duration: '30s', x: '12px', y: '-20px', delay: '-10s' },
];

export default function AuthSplitLayout({ title, asideFooter, children }) {
    const { appearance } = usePage().props;

    useEffect(() => {
        document.documentElement.classList.toggle('dark', appearance === 'dark');
    }, [appearance]);

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-8">
            <Head title={title} />
            <Toast />
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <aside className="relative hidden w-[42%] flex-col justify-center overflow-hidden bg-indigo-50 px-10 py-10 lg:flex">
                    {orbs.map((orb, index) => (
                        <div
                            key={index}
                            className={`register-orb pointer-events-none absolute rounded-full ${orb.className}`}
                            style={{
                                '--float-duration': orb.duration,
                                '--float-x': orb.x,
                                '--float-y': orb.y,
                                animationDelay: orb.delay,
                            }}
                        />
                    ))}
                    <div className="relative z-10">
                        <Logo className="h-8 w-auto" />
                        <h1 className="mt-14 text-4xl font-semibold leading-tight tracking-tight text-slate-900">
                            Streamline your billing in minutes
                        </h1>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                            Join thousands of modern businesses managing their invoices, tracking expenses, and getting paid
                            faster with Offacto.
                        </p>
                        <ul className="mt-8 space-y-3 text-sm text-slate-700">
                            {['Automated recurring invoices', 'Multi-currency support', 'Seamless tax calculations'].map(
                                (item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                            ✓
                                        </span>
                                        {item}
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                    {asideFooter}
                </aside>
                <section className="flex w-full flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
                    <div className="mx-auto w-full max-w-md">{children}</div>
                </section>
            </div>
        </div>
    );
}

export const inputClass = (error) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
        error ? 'border-rose-400' : 'border-slate-200'
    }`;
