import { TagSelector } from './TagSelector';

interface CategoriaOption {
    id: number;
    nombre: string;
}

interface AdvancedFiltersPanelProps {
    fechaDesde: string;
    onFechaDesde: (v: string) => void;
    fechaHasta: string;
    onFechaHasta: (v: string) => void;
    filterCategoria: string;
    onFilterCategoria: (v: string) => void;
    montoMin: string;
    onMontoMin: (v: string) => void;
    montoMax: string;
    onMontoMax: (v: string) => void;
    filterTagIds: number[];
    onFilterTagIds: (ids: number[]) => void;
    categorias: CategoriaOption[];
    resultCount: number;
    onClear: () => void;
}

/**
 * Panel de "Filtros Avanzados" compartido por GastosPage e IngresosPage
 * (fecha desde/hasta, categoría, monto mín/máx, tags y contador de resultados).
 */
export const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
    fechaDesde, onFechaDesde,
    fechaHasta, onFechaHasta,
    filterCategoria, onFilterCategoria,
    montoMin, onMontoMin,
    montoMax, onMontoMax,
    filterTagIds, onFilterTagIds,
    categorias,
    resultCount,
    onClear,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold dark:text-white">Filtros Avanzados</h3>
                <button
                    onClick={onClear}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    Limpiar Filtros
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="fecha-desde" className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha Desde</label>
                    <input
                        id="fecha-desde"
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => onFechaDesde(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div>
                    <label htmlFor="fecha-hasta" className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha Hasta</label>
                    <input
                        id="fecha-hasta"
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => onFechaHasta(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div>
                    <label htmlFor="filter-categoria" className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría</label>
                    <select
                        id="filter-categoria"
                        value={filterCategoria}
                        onChange={(e) => onFilterCategoria(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">Todas</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="monto-minimo" className="block text-sm font-medium mb-1 dark:text-gray-300">Monto Mínimo</label>
                    <input
                        id="monto-minimo"
                        type="number"
                        step="0.01"
                        value={montoMin}
                        onChange={(e) => onMontoMin(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label htmlFor="monto-maximo" className="block text-sm font-medium mb-1 dark:text-gray-300">Monto Máximo</label>
                    <input
                        id="monto-maximo"
                        type="number"
                        step="0.01"
                        value={montoMax}
                        onChange={(e) => onMontoMax(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="0.00"
                    />
                </div>

                {/* Tags Filter */}
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Filtrar por Tags</label>
                    <TagSelector
                        selectedTagIds={filterTagIds}
                        onChange={onFilterTagIds}
                    />
                </div>

                <div className="flex items-end">
                    <div className="text-sm dark:text-gray-300">
                        <strong>{resultCount}</strong> resultados
                    </div>
                </div>
            </div>
        </div>
    );
};
