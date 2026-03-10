export const Skeleton = ({ className = '', variant = 'text' }: { className?: string; variant?: 'text' | 'circular' | 'rectangular' }) => {
    const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

export const TableSkeleton = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-8" />
                    ))}
                </div>
            ))}
        </div>
    );
};

export const CardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );
};
