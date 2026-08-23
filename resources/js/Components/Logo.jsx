export default function Logo({ variant = 'dark', className = 'h-8 w-auto' }) {
    const src = variant === 'white' ? '/assets/images/logo-offacto-white.svg' : '/assets/images/logo-offacto.svg';

    return <img src={src} alt="Offacto" className={className} />;
}
