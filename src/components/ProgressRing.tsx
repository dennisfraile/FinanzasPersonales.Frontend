interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
    children?: React.ReactNode;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 80,
    strokeWidth = 6,
    color,
    bgColor = 'stroke-gray-200 dark:stroke-gray-700',
    children,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

    const getColor = () => {
        if (color) return color;
        if (progress >= 100) return 'stroke-green-500';
        if (progress >= 75) return 'stroke-emerald-500';
        if (progress >= 50) return 'stroke-blue-500';
        return 'stroke-purple-500';
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    className={bgColor}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${getColor()} transition-all duration-500 ease-out`}
                />
            </svg>
            {children && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    );
};

export default ProgressRing;
