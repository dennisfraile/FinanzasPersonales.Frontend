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

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Summary */}
            <Skeleton variant="rectangular" className="h-16 w-full" />
            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                ))}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton variant="rectangular" className="h-[350px]" />
                <Skeleton variant="rectangular" className="h-[350px]" />
            </div>
        </div>
    );
};

export const ChartSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-3 w-2/3 mb-4" />
            <Skeleton variant="rectangular" className="h-[250px]" />
        </div>
    );
};

export const BudgetCardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex gap-2">
                    <Skeleton variant="circular" className="h-5 w-5" />
                    <Skeleton variant="circular" className="h-5 w-5" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton variant="rectangular" className="h-3 w-full rounded-full" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        </div>
    );
};

export const MetaCardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3" />
                <div className="flex gap-2">
                    <Skeleton variant="circular" className="h-5 w-5" />
                    <Skeleton variant="circular" className="h-5 w-5" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton variant="rectangular" className="h-3 w-full rounded-full" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-16" /></div>
                <div className="flex justify-between"><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-20" /></div>
                <div className="flex justify-between"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-16" /></div>
            </div>
            <Skeleton variant="rectangular" className="h-10 w-full rounded-lg" />
        </div>
    );
};

export const ListItemSkeleton = ({ count = 5 }: { count?: number }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton variant="circular" className="h-8 w-8 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
};
