import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { type SectionHelp } from '../utils/helpContent';

interface HelpTooltipProps {
    content: SectionHelp;
}

export default function HelpTooltip({ content }: HelpTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative inline-block" ref={panelRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 transition-colors"
                aria-label="Ayuda"
                title="Ayuda sobre esta seccion"
            >
                <HelpCircle size={20} />
            </button>

            {isOpen && (
                <>
                    {/* Mobile: fixed bottom sheet */}
                    <div className="sm:hidden fixed inset-0 bg-black/40 z-50" onClick={() => setIsOpen(false)}>
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl p-5 max-h-[70vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">{content.title}</h3>
                                <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Cerrar">
                                    <X size={18} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{content.description}</p>
                            {content.tips.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Consejos</p>
                                    <ul className="space-y-2">
                                        {content.tips.map((tip, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop: dropdown panel */}
                    <div className="hidden sm:block absolute left-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{content.title}</h3>
                            <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Cerrar">
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{content.description}</p>
                        {content.tips.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Consejos</p>
                                <ul className="space-y-1.5">
                                    {content.tips.map((tip, i) => (
                                        <li key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
