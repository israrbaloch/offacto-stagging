const MARK_SRC = '/assets/images/favicon.ico';

/** Text wordmark. The logo SVG draws the O as two chevrons, which reads as "<>ffecto". */
export default function Logo({ variant = 'dark', className = 'h-8 w-auto' }) {
    const onDark = variant === 'white';

    return (
        <span className="inline-flex items-center gap-2">
            <img src={MARK_SRC} alt="" className={`object-contain ${className}`} />
            <span
                className={`font-[Urbanist,system-ui,sans-serif] text-[1.35rem] font-extrabold leading-none tracking-[-0.03em] ${
                    onDark ? 'text-white' : 'text-[#0E1250]'
                }`}
            >
                Offacto
            </span>
        </span>
    );
}
