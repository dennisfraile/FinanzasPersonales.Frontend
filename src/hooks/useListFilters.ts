import { useMemo, useState } from 'react';

/** Campos mínimos que necesita el filtrado compartido de listas (gastos/ingresos). */
interface FilterableItem {
    categoriaId: number;
    fecha: string;
    monto: number;
}

const DEFAULT_ITEMS_PER_PAGE = 10;

/**
 * Estado y lógica compartidos de las páginas tipo lista (Gastos, Ingresos):
 * búsqueda, filtro por categoría, filtros avanzados (fecha/monto/tags),
 * paginación y total. Antes estaba duplicado casi idéntico en ambas páginas.
 *
 * El criterio de búsqueda por texto se pasa como `matchesSearch` porque difiere
 * entre páginas (Gastos busca por descripción; Ingresos por monto/categoría).
 *
 * Nota: `filterTagIds` se expone para la UI pero NO se aplica al filtrado, igual
 * que en el código original (se preserva el comportamiento existente).
 */
export function useListFilters<T extends FilterableItem>(
    items: T[],
    matchesSearch: (item: T, term: string) => boolean,
    itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE,
) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [montoMin, setMontoMin] = useState('');
    const [montoMax, setMontoMax] = useState('');
    const [filterTagIds, setFilterTagIds] = useState<number[]>([]);

    const clearFilters = () => {
        setSearchTerm('');
        setFilterCategoria('');
        setFechaDesde('');
        setFechaHasta('');
        setMontoMin('');
        setMontoMax('');
        setFilterTagIds([]);
        setCurrentPage(1);
    };

    const filtered = useMemo(() => {
        if (!Array.isArray(items)) return [];
        return items.filter((item) => {
            const okSearch = matchesSearch(item, searchTerm);
            const okCategoria = !filterCategoria || item.categoriaId.toString() === filterCategoria;
            const okFechaDesde = !fechaDesde || item.fecha >= fechaDesde;
            const okFechaHasta = !fechaHasta || item.fecha <= fechaHasta;
            const okMontoMin = !montoMin || item.monto >= parseFloat(montoMin);
            const okMontoMax = !montoMax || item.monto <= parseFloat(montoMax);
            return okSearch && okCategoria && okFechaDesde && okFechaHasta && okMontoMin && okMontoMax;
        });
        // matchesSearch se asume estable (definida fuera del render o memoizada por el caller).
    }, [items, matchesSearch, searchTerm, filterCategoria, fechaDesde, fechaHasta, montoMin, montoMax]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filtered.slice(start, start + itemsPerPage);
    }, [filtered, currentPage, itemsPerPage]);

    const total = useMemo(() => filtered.reduce((sum, item) => sum + item.monto, 0), [filtered]);

    return {
        // estado básico
        searchTerm, setSearchTerm,
        filterCategoria, setFilterCategoria,
        currentPage, setCurrentPage,
        showFilters, setShowFilters,
        // filtros avanzados
        fechaDesde, setFechaDesde,
        fechaHasta, setFechaHasta,
        montoMin, setMontoMin,
        montoMax, setMontoMax,
        filterTagIds, setFilterTagIds,
        clearFilters,
        // resultados derivados
        filtered,
        paginated,
        totalPages,
        total,
    };
}
