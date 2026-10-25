export default function DocumentPaperWave({ primary, secondary }) {
    return (
        <svg className="offacto-demo-paper-wave" viewBox="0 0 1200 100" preserveAspectRatio="none" aria-hidden>
            <path
                fill={primary}
                fillOpacity="0.12"
                d="M0,40 C200,80 400,0 600,35 C800,70 1000,20 1200,50 L1200,100 L0,100 Z"
            />
            <path
                fill={secondary}
                fillOpacity="0.18"
                d="M0,55 C250,95 450,25 650,60 C850,90 1050,35 1200,65 L1200,100 L0,100 Z"
            />
        </svg>
    );
}
