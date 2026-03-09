import { useTags } from '../hooks/useQueryHooks';
import { X } from 'lucide-react';

interface TagSelectorProps {
    selectedTagIds: number[];
    onChange: (tagIds: number[]) => void;
}

export const TagSelector = ({ selectedTagIds, onChange }: TagSelectorProps) => {
    const { data: allTags = [], isLoading } = useTags();

    const toggleTag = (tagId: number) => {
        if (selectedTagIds.includes(tagId)) {
            onChange(selectedTagIds.filter(id => id !== tagId));
        } else {
            onChange([...selectedTagIds, tagId]);
        }
    };

    const getSelectedTags = () => {
        return allTags.filter(tag => selectedTagIds.includes(tag.id));
    };

    if (isLoading) return <div className="text-sm text-gray-500">Cargando tags...</div>;

    return (
        <div>
            {/* Selected Tags */}
            {getSelectedTags().length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {getSelectedTags().map(tag => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tag.color }}
                        >
                            {tag.nombre}
                            <button
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                className="hover:bg-black/10 rounded-full p-0.5"
                                aria-label={`Quitar tag ${tag.nombre}`}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Available Tags */}
            <div className="flex flex-wrap gap-2">
                {allTags
                    .filter(tag => !selectedTagIds.includes(tag.id))
                    .map(tag => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className="px-3 py-1 rounded-full text-xs font-medium border-2 hover:opacity-80 transition-opacity"
                            style={{
                                borderColor: tag.color,
                                color: tag.color,
                            }}
                        >
                            + {tag.nombre}
                        </button>
                    ))}
            </div>
        </div>
    );
};
