import { useState } from 'react';
import { BookOpen, X, Search } from 'lucide-react';
import { financialGlossary } from '../utils/helpContent';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function GlossaryModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const glossaryModalRef = useFocusTrap<HTMLDivElement>(isOpen, () => setIsOpen(false));

    const filtered = financialGlossary.filter(
        item =>
            item.term.toLowerCase().includes(search.toLowerCase()) ||
            item.definition.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Glosario financiero"
            >
                <BookOpen size={16} />
                <span className="hidden sm:inline">Glosario</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div ref={glossaryModalRef} role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <BookOpen size={20} />
                                Glosario Financiero
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b dark:border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar termino..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-4 space-y-4">
                            {filtered.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No se encontraron resultados</p>
                            )}
                            {filtered.map((item, i) => (
                                <div key={i} className="border-b dark:border-gray-700 pb-3 last:border-b-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.term}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.definition}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
