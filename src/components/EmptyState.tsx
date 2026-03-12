import { Receipt, Banknote, PiggyBank, Target, Wallet, Tags, Tag } from 'lucide-react';
import { type EmptyStateContent } from '../utils/helpContent';

const iconMap: Record<string, React.ElementType> = {
    receipt: Receipt,
    banknote: Banknote,
    'piggy-bank': PiggyBank,
    target: Target,
    wallet: Wallet,
    tags: Tags,
    tag: Tag,
};

interface EmptyStateProps {
    content: EmptyStateContent;
    onAction: () => void;
}

export default function EmptyState({ content, onAction }: EmptyStateProps) {
    const Icon = iconMap[content.icon] || Receipt;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                <Icon className="text-blue-500 dark:text-blue-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 text-center">
                {content.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6 text-sm leading-relaxed">
                {content.description}
            </p>
            <button
                onClick={onAction}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                {content.actionLabel}
            </button>
        </div>
    );
}
