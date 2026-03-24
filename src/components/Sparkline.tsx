interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, width = 120, height = 30, color = '#3b82f6', className = '' }) => {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className={className}>
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default Sparkline;
