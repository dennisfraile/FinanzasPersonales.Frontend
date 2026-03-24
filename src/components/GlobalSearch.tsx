import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingDown, DollarSign, Wallet, Target, FileText, CreditCard, CalendarClock } from 'lucide-react';
import { useGastos, usePresupuestos, useMetas, useIngresos, useGastosProgramados, useDeudas } from '../hooks/useQueryHooks';
import { useCuentas } from '../hooks/useCuentas';

interface SearchResult {
    id: string;
    title: string;
    subtitle: string;
    type: 'gasto' | 'ingreso' | 'cuenta' | 'presupuesto' | 'meta' | 'deuda' | 'programado' | 'pagina';
    path: string;
    icon: React.ElementType;
    color: string;
}

const PAGES: SearchResult[] = [
    { id: 'p-dashboard', title: 'Dashboard', subtitle: 'Resumen general', type: 'pagina', path: '/dashboard', icon: FileText, color: 'text-blue-500' },
    { id: 'p-gastos', title: 'Gastos', subtitle: 'Registro de gastos', type: 'pagina', path: '/gastos', icon: TrendingDown, color: 'text-red-500' },
    { id: 'p-ingresos', title: 'Ingresos', subtitle: 'Registro de ingresos', type: 'pagina', path: '/ingresos', icon: DollarSign, color: 'text-green-500' },
    { id: 'p-cuentas', title: 'Cuentas', subtitle: 'Administrar cuentas', type: 'pagina', path: '/cuentas', icon: Wallet, color: 'text-blue-500' },
    { id: 'p-presupuestos', title: 'Presupuestos', subtitle: 'Control de presupuestos', type: 'pagina', path: '/presupuestos', icon: FileText, color: 'text-purple-500' },
    { id: 'p-metas', title: 'Metas', subtitle: 'Metas de ahorro', type: 'pagina', path: '/metas', icon: Target, color: 'text-emerald-500' },
    { id: 'p-deudas', title: 'Deudas', subtitle: 'Control de deudas', type: 'pagina', path: '/deudas', icon: CreditCard, color: 'text-orange-500' },
    { id: 'p-programados', title: 'Gastos programados', subtitle: 'Pagos con fecha limite', type: 'pagina', path: '/gastos-programados', icon: CalendarClock, color: 'text-amber-500' },
    { id: 'p-calendario', title: 'Calendario', subtitle: 'Vista de calendario', type: 'pagina', path: '/calendario', icon: CalendarClock, color: 'text-indigo-500' },
    { id: 'p-reportes', title: 'Reportes', subtitle: 'Analisis y reportes', type: 'pagina', path: '/reportes', icon: FileText, color: 'text-teal-500' },
    { id: 'p-recurrentes-g', title: 'Gastos recurrentes', subtitle: 'Gastos automaticos', type: 'pagina', path: '/gastos-recurrentes', icon: TrendingDown, color: 'text-red-400' },
    { id: 'p-recurrentes-i', title: 'Ingresos recurrentes', subtitle: 'Ingresos automaticos', type: 'pagina', path: '/ingresos-recurrentes', icon: DollarSign, color: 'text-green-400' },
    { id: 'p-plantillas', title: 'Plantillas', subtitle: 'Plantillas de gastos', type: 'pagina', path: '/plantillas', icon: FileText, color: 'text-gray-500' },
    { id: 'p-categorias', title: 'Categorias', subtitle: 'Administrar categorias', type: 'pagina', path: '/categorias', icon: FileText, color: 'text-violet-500' },
    { id: 'p-tags', title: 'Tags', subtitle: 'Etiquetas', type: 'pagina', path: '/tags', icon: FileText, color: 'text-pink-500' },
    { id: 'p-importar', title: 'Importar CSV', subtitle: 'Importar datos', type: 'pagina', path: '/importar-csv', icon: FileText, color: 'text-cyan-500' },
    { id: 'p-ayuda', title: 'Centro de ayuda', subtitle: 'Guias y glosario', type: 'pagina', path: '/ayuda', icon: FileText, color: 'text-blue-400' },
];

const TYPE_LABELS: Record<string, string> = {
    pagina: 'Paginas',
    gasto: 'Gastos',
    ingreso: 'Ingresos',
    cuenta: 'Cuentas',
    presupuesto: 'Presupuestos',
    meta: 'Metas',
    deuda: 'Deudas',
    programado: 'Programados',
};

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { data: gastos = [] } = useGastos();
    const { data: ingresos = [] } = useIngresos();
    const { cuentas = [] } = useCuentas();
    const { data: presupuestos = [] } = usePresupuestos();
    const { data: metas = [] } = useMetas();
    const { data: deudas = [] } = useDeudas();
    const { data: programados = [] } = useGastosProgramados();

    const dataResults = useMemo<SearchResult[]>(() => {
        const results: SearchResult[] = [];

        gastos.forEach(g => results.push({
            id: `g-${g.id}`,
            title: g.descripcion || `Gasto #${g.id}`,
            subtitle: `$${g.monto.toFixed(2)} · ${g.categoriaNombre || 'Sin categoria'} · ${new Date(g.fecha).toLocaleDateString()}`,
            type: 'gasto',
            path: '/gastos',
            icon: TrendingDown,
            color: 'text-red-500',
        }));

        ingresos.forEach(i => results.push({
            id: `i-${i.id}`,
            title: i.descripcion || `Ingreso #${i.id}`,
            subtitle: `$${i.monto.toFixed(2)} · ${i.categoriaNombre || 'Sin categoria'} · ${new Date(i.fecha).toLocaleDateString()}`,
            type: 'ingreso',
            path: '/ingresos',
            icon: DollarSign,
            color: 'text-green-500',
        }));

        (cuentas || []).forEach(c => results.push({
            id: `c-${c.id}`,
            title: c.nombre,
            subtitle: `$${c.balanceActual.toFixed(2)} · ${c.tipo}`,
            type: 'cuenta',
            path: '/cuentas',
            icon: Wallet,
            color: 'text-blue-500',
        }));

        presupuestos.forEach(p => results.push({
            id: `pr-${p.id}`,
            title: p.categoriaNombre,
            subtitle: `$${p.gastadoActual.toFixed(2)} / $${p.montoLimite.toFixed(2)} · ${p.periodo}`,
            type: 'presupuesto',
            path: '/presupuestos',
            icon: FileText,
            color: 'text-purple-500',
        }));

        metas.forEach(m => results.push({
            id: `m-${m.id}`,
            title: m.metas,
            subtitle: `$${m.ahorroActual.toFixed(2)} / $${m.montoTotal.toFixed(2)}`,
            type: 'meta',
            path: '/metas',
            icon: Target,
            color: 'text-emerald-500',
        }));

        deudas.forEach(d => results.push({
            id: `d-${d.id}`,
            title: d.nombre,
            subtitle: `Saldo: $${d.saldoActual.toFixed(2)} · ${d.tipo}`,
            type: 'deuda',
            path: '/deudas',
            icon: CreditCard,
            color: 'text-orange-500',
        }));

        programados.forEach(gp => results.push({
            id: `gp-${gp.id}`,
            title: gp.descripcion,
            subtitle: `$${gp.monto.toFixed(2)} · ${gp.estado} · Vence: ${new Date(gp.fechaVencimiento).toLocaleDateString()}`,
            type: 'programado',
            path: '/gastos-programados',
            icon: CalendarClock,
            color: 'text-amber-500',
        }));

        return results;
    }, [gastos, ingresos, cuentas, presupuestos, metas, deudas, programados]);

    const filteredResults = useMemo(() => {
        if (!query.trim()) {
            return PAGES.slice(0, 8);
        }

        const q = query.toLowerCase();
        const all = [...PAGES, ...dataResults];
        return all
            .filter(r => r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q))
            .slice(0, 20);
    }, [query, dataResults]);

    // Group results by type
    const groupedResults = useMemo(() => {
        const groups: Record<string, SearchResult[]> = {};
        filteredResults.forEach(r => {
            if (!groups[r.type]) groups[r.type] = [];
            groups[r.type].push(r);
        });
        return groups;
    }, [filteredResults]);

    // Flat list for keyboard nav
    const flatResults = filteredResults;

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Scroll selected into view
    useEffect(() => {
        const el = resultsRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        el?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    const handleSelect = (result: SearchResult) => {
        navigate(result.path);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (flatResults[selectedIndex]) {
                handleSelect(flatResults[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    let flatIndex = 0;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <Search size={20} className="text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Buscar gastos, ingresos, cuentas, paginas..."
                        className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <X size={16} className="text-gray-400" />
                        </button>
                    )}
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 rounded font-mono">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto py-2">
                    {flatResults.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <Search size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No se encontraron resultados para "{query}"</p>
                        </div>
                    ) : (
                        Object.entries(groupedResults).map(([type, results]) => (
                            <div key={type}>
                                <div className="px-4 py-1.5">
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                        {TYPE_LABELS[type] || type}
                                    </span>
                                </div>
                                {results.map(result => {
                                    const currentIndex = flatIndex++;
                                    const Icon = result.icon;
                                    return (
                                        <button
                                            key={result.id}
                                            data-index={currentIndex}
                                            onClick={() => handleSelect(result)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                                currentIndex === selectedIndex
                                                    ? 'bg-blue-50 dark:bg-blue-900/30'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                        >
                                            <Icon size={18} className={`shrink-0 ${result.color}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.subtitle}</p>
                                            </div>
                                            {currentIndex === selectedIndex && (
                                                <span className="text-xs text-gray-400">Enter</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono">↑↓</kbd> navegar
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono">Enter</kbd> abrir
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono">Esc</kbd> cerrar
                    </span>
                </div>
            </div>
        </div>
    );
};
