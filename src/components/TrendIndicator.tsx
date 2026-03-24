import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
    current: number;
    previous: number;
    invertColors?: boolean; // true = green when down (expenses), false = green when up (income)
    size?: 'sm' | 'md';
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ current, previous, invertColors = false, size = 'sm' }) => {
    if (previous === 0) return null;

    const diff = ((current - previous) / previous) * 100;
    const isUp = diff > 0;
    const isFlat = Math.abs(diff) < 1;

    if (isFlat) {
        return (
            <span className={`inline-flex items-center gap-0.5 text-gray-500 ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
                <Minus size={size === 'sm' ? 10 : 12} />
                <span>sin cambio</span>
            </span>
        );
    }

    const isGood = invertColors ? !isUp : isUp;
    const colorClass = isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

    return (
        <span className={`inline-flex items-center gap-0.5 ${colorClass} ${size === 'sm' ? 'text-[10px]' : 'text-xs'} font-medium`}>
            {isUp ? <TrendingUp size={size === 'sm' ? 10 : 12} /> : <TrendingDown size={size === 'sm' ? 10 : 12} />}
            <span>{isUp ? '+' : ''}{diff.toFixed(0)}% vs anterior</span>
        </span>
    );
};

export default TrendIndicator;
