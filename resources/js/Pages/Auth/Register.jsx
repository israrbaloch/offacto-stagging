import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Toast from '../../Components/Toast';
import { optionsFromMap } from '../../lib/utils';

const testimonials = [
    {
        quote: 'Offacto transformed our chaotic billing process into a smooth, automated workflow. Highly recommended.',
        author: 'Sarah Jenkins, CEO',
    },
    {
        quote: 'We send offers and invoices in minutes now. The team finally has a single place for every client.',
        author: 'Marcus Hale, Founder',
    },
    {
        quote: 'Approvals, payments, and follow-up used to live in three tools. Offacto brought it all together.',
        author: 'Lena Ortiz, Operations',
    },
];

const orbs = [
    { className: '-left-20 top-8 h-56 w-56 bg-indigo-200/45', duration: '32s', x: '22px', y: '-28px', delay: '0s' },
    { className: '-right-16 top-28 h-72 w-72 bg-violet-200/50', duration: '38s', x: '-26px', y: '20px', delay: '-8s' },
    { className: 'left-16 bottom-10 h-40 w-40 bg-indigo-300/30', duration: '26s', x: '16px', y: '24px', delay: '-4s' },
    { className: 'right-10 bottom-32 h-24 w-24 bg-fuchsia-200/40', duration: '22s', x: '-14px', y: '-18px', delay: '-12s' },
    { className: 'left-1/2 top-1/3 h-16 w-16 bg-sky-200/50', duration: '20s', x: '20px', y: '12px', delay: '-2s' },
    { className: 'left-8 top-1/2 h-10 w-10 bg-violet-300/35', duration: '18s', x: '-10px', y: '16px', delay: '-6s' },
    { className: 'right-1/3 top-12 h-14 w-14 bg-indigo-100/80', duration: '30s', x: '12px', y: '-20px', delay: '-10s' },
];

function Field({ label, error, className = '', children }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>}
            {children}
            {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
        </label>
    );
}

const inputClass = (error) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
        error ? 'border-rose-400' : 'border-slate-200'
    }`;

export default function Register({ languages = {} }) {
    const [showPassword, setShowPassword] = useState(false);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const testimonial = testimonials[testimonialIndex];

    useEffect(() => {
        const timer = setInterval(() => {
            setTestimonialIndex((current) => (current + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);
    const { data, setData, post, processing, errors, transform } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        first_name: '',
        surname: '',
        email_company: '',
        phone: '',
        vat_number: '',
        street: '',
        house: '',
        postal_code: '',
        city: '',
        language: '',
        self_employed_activity: '',
    });

    const submit = (e) => {
        e.preventDefault();
        transform((form) => ({
            ...form,
            name: form.name || `${form.first_name} ${form.surname}`.trim(),
            email_company: form.email_company || form.email,
            password_confirmation: form.password_confirmation || form.password,
        }));
        post('/register');
    };

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-8">
            <Head title="Register" />
            <Toast />
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <aside className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-indigo-50 px-10 py-10 lg:flex">
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
                    <div className="relative">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                                O
                            </span>
                            <span className="text-lg font-semibold text-slate-900">Offacto</span>
                        </div>
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
                    <blockquote className="relative z-10 mt-10 min-h-[148px] rounded-2xl bg-white p-5 shadow-sm">
                        <div key={testimonial.author} className="register-quote">
                            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                                “
                            </div>
                            <p className="text-sm leading-6 text-slate-600">{testimonial.quote}</p>
                            <footer className="mt-3 text-xs font-medium text-slate-400">{testimonial.author}</footer>
                        </div>
                    </blockquote>
                </aside>

                <section className="flex w-full flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
                    <div className="mx-auto w-full max-w-lg">
                        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Create your account</h2>
                        <p className="mt-2 text-sm text-slate-500">Start your 14-day free trial. No credit card required.</p>

                        <form onSubmit={submit} className="mt-8 space-y-8">
                            <fieldset>
                                <legend className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                    Account info
                                </legend>
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="First Name" error={errors.first_name}>
                                            <input
                                                className={inputClass(errors.first_name)}
                                                placeholder="Jane"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                            />
                                        </Field>
                                        <Field label="Last Name" error={errors.surname}>
                                            <input
                                                className={inputClass(errors.surname)}
                                                placeholder="Doe"
                                                value={data.surname}
                                                onChange={(e) => setData('surname', e.target.value)}
                                            />
                                        </Field>
                                    </div>
                                    <Field label="Email Address" error={errors.email}>
                                        <input
                                            type="email"
                                            className={inputClass(errors.email)}
                                            placeholder="jane@company.com"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </Field>
                                    <div>
                                        <span className="mb-1.5 block text-sm font-medium text-slate-600">Password</span>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className={`${inputClass(errors.password)} pr-14`}
                                                placeholder="Create a password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-3 text-xs font-medium text-slate-400 hover:text-slate-600"
                                                onClick={() => setShowPassword((v) => !v)}
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                        {errors.password && <span className="mt-1 block text-xs text-rose-600">{errors.password}</span>}
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                    Company setup
                                </legend>
                                <div className="space-y-4">
                                    <Field label="Company Name" error={errors.company_name}>
                                        <input
                                            className={inputClass(errors.company_name)}
                                            placeholder="Acme Corp"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                        />
                                    </Field>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="VAT Number (Optional)" error={errors.vat_number}>
                                            <input
                                                className={inputClass(errors.vat_number)}
                                                placeholder="BE0123456789"
                                                value={data.vat_number}
                                                onChange={(e) => setData('vat_number', e.target.value)}
                                            />
                                        </Field>
                                        <Field label="Activity Type" error={errors.self_employed_activity}>
                                            <select
                                                className={inputClass(errors.self_employed_activity)}
                                                value={data.self_employed_activity}
                                                onChange={(e) => setData('self_employed_activity', e.target.value)}
                                            >
                                                <option value="">Select activity</option>
                                                <option value="main_profession">Main profession</option>
                                                <option value="secondary_profession">Secondary profession</option>
                                            </select>
                                        </Field>
                                    </div>
                                    <Field label="Company Email" error={errors.email_company}>
                                        <input
                                            type="email"
                                            className={inputClass(errors.email_company)}
                                            placeholder="billing@company.com"
                                            value={data.email_company}
                                            onChange={(e) => setData('email_company', e.target.value)}
                                        />
                                    </Field>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Phone" error={errors.phone}>
                                            <input
                                                className={inputClass(errors.phone)}
                                                placeholder="+32 470 00 00 00"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                            />
                                        </Field>
                                        <Field label="Language" error={errors.language}>
                                            <select
                                                className={inputClass(errors.language)}
                                                value={data.language}
                                                onChange={(e) => setData('language', e.target.value)}
                                            >
                                                <option value="">Select language</option>
                                                {optionsFromMap(languages).map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <Field label="Street" className="sm:col-span-2" error={errors.street}>
                                            <input
                                                className={inputClass(errors.street)}
                                                placeholder="Main Street"
                                                value={data.street}
                                                onChange={(e) => setData('street', e.target.value)}
                                            />
                                        </Field>
                                        <Field label="No." error={errors.house}>
                                            <input
                                                className={inputClass(errors.house)}
                                                placeholder="12"
                                                value={data.house}
                                                onChange={(e) => setData('house', e.target.value)}
                                            />
                                        </Field>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Postal code" error={errors.postal_code}>
                                            <input
                                                className={inputClass(errors.postal_code)}
                                                placeholder="1000"
                                                value={data.postal_code}
                                                onChange={(e) => setData('postal_code', e.target.value)}
                                            />
                                        </Field>
                                        <Field label="City" error={errors.city}>
                                            <input
                                                className={inputClass(errors.city)}
                                                placeholder="Brussels"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </fieldset>

                            {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                            >
                                Start 14-Day Free Trial
                                <span aria-hidden="true">→</span>
                            </button>
                        </form>

                        <p className="mt-4 text-center text-xs text-slate-400">
                            By registering, you agree to our{' '}
                            <span className="font-medium text-slate-600">Terms of Service</span> and{' '}
                            <span className="font-medium text-slate-600">Privacy Policy</span>.
                        </p>
                        <p className="mt-6 text-center text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
