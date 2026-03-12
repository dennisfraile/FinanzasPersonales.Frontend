import { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

interface SuggestionBannerProps {
    suggestions: string[];
}

export default function SuggestionBanner({ suggestions }: SuggestionBannerProps) {
    const [dismissed, setDismissed] = useState<Set<number>>(new Set());

    const visible = suggestions.filter((_, i) => !dismissed.has(i));
    if (visible.length === 0) return null;

    const dismiss = (index: number) => {
        setDismissed(prev => new Set(prev).add(index));
    };

    return (
        <div className="space-y-2 mb-6">
            {suggestions.map((suggestion, i) => {
                if (dismissed.has(i)) return null;
                return (
                    <div
                        key={i}
                        className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3"
                    >
                        <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">{suggestion}</p>
                        <button
                            onClick={() => dismiss(i)}
                            className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 shrink-0"
                            aria-label="Cerrar sugerencia"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
