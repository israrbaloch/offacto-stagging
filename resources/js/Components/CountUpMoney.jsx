import { useCountUpMoney } from '../lib/useCountUpMoney';

export default function CountUpMoney({ value, className, duration = 700 }) {
    const display = useCountUpMoney(value, { duration });

    return <span className={className}>{display}</span>;
}
