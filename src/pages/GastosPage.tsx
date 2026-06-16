import { useState, useMemo } from 'react';
import { type Gasto, type CreateGastoDto } from '../services/gastosService';
import { type Categoria } from '../services/categoriasService';
import { Trash2, Plus, Edit2, Search, ShoppingCart, Download, FileText, ArrowLeftRight, Copy, CheckSquare, Square, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Pagination } from '../components/Pagination';
import { CuentaSelector } from '../components/CuentaSelector';
import { AdjuntosList } from '../components/AdjuntosList';
import { TableSkeleton } from '../components/Skeleton';
import { TagSelector } from '../components/TagSelector';
import { useGastos, useCreateGasto, useUpdateGasto, useDeleteGasto, useCategorias, useCreateCategoria, useTransferirSaldoGasto } from '../hooks/useQueryHooks';
import HelpTooltip from '../components/HelpTooltip';
import EmptyState from '../components/EmptyState';
import DetallesGastoPanel from '../components/DetallesGastoPanel';
import { useConfirm } from '../context/ConfirmContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { sectionHelp, emptyStates } from '../utils/helpContent';
import { exportToCsv } from '../utils/csv';
import { useListFilters } from '../hooks/useListFilters';
import { AdvancedFiltersPanel } from '../components/AdvancedFiltersPanel';

const matchesGastoSearch = (gasto: Gasto, term: string) =>
    (gasto.descripcion ?? '').toLowerCase().includes(term.toLowerCase());

export const GastosPage = () => {
    const { data: gastos = [], isLoading } = useGastos();
    const { data: allCategorias = [] } = useCategorias();
    const categorias = useMemo(() => allCategorias.filter((c: Categoria) => c.tipo === 'Gasto'), [allCategorias]);

    const createGastoMutation = useCreateGasto();
    const updateGastoMutation = useUpdateGasto();
    const deleteGastoMutation = useDeleteGasto();
    const createCategoriaMutation = useCreateCategoria();
    const transferirSaldoMutation = useTransferirSaldoGasto();
    const confirm = useConfirm();

    const {
        searchTerm, setSearchTerm,
        filterCategoria, setFilterCategoria,
        currentPage, setCurrentPage,
        showFilters, setShowFilters,
        fechaDesde, setFechaDesde,
        fechaHasta, setFechaHasta,
        montoMin, setMontoMin,
        montoMax, setMontoMax,
        filterTagIds, setFilterTagIds,
        clearFilters,
        filtered: filteredGastos,
        paginated: paginatedGastos,
        totalPages,
        total,
    } = useListFilters(gastos, matchesGastoSearch);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [detallesGastoId, setDetallesGastoId] = useState<number | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferData, setTransferData] = useState({ gastoOrigenId: 0, gastoDestinoId: 0, monto: 0 });
    const [formData, setFormData] = useState<CreateGastoDto>({
        fecha: new Date().toISOString().split('T')[0],
        categoriaId: 0,
        tipo: 'Fijo',
        descripcion: '',
        monto: 0,
        cuentaId: null,
        tagIds: [],
    });
    const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', tipo: 'Gasto' });

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkCategoriaId, setBulkCategoriaId] = useState(0);
    const [showBulkCatModal, setShowBulkCatModal] = useState(false);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedGastos.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedGastos.map(g => g.id)));
        }
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!(await confirm(`¿Eliminar ${selectedIds.size} gasto(s) seleccionados?`))) return;
        try {
            for (const id of selectedIds) {
                await deleteGastoMutation.mutateAsync(id);
            }
            toast.success(`${selectedIds.size} gasto(s) eliminados`);
            clearSelection();
        } catch (error) {
            toast.error('Error al eliminar gastos');
        }
    };

    const handleBulkChangeCategory = async () => {
        if (selectedIds.size === 0 || !bulkCategoriaId) return;
        try {
            for (const id of selectedIds) {
                const gasto = gastos.find(g => g.id === id);
                if (gasto) {
                    await updateGastoMutation.mutateAsync({
                        id,
                        data: {
                            fecha: gasto.fecha.split('T')[0],
                            categoriaId: bulkCategoriaId,
                            tipo: gasto.tipo || 'Fijo',
                            descripcion: gasto.descripcion ?? '',
                            monto: gasto.monto,
                            cuentaId: gasto.cuentaId ?? null,
                            tagIds: gasto.tagIds || [],
                        },
                    });
                }
            }
            toast.success(`Categoría actualizada en ${selectedIds.size} gasto(s)`);
            clearSelection();
            setShowBulkCatModal(false);
            setBulkCategoriaId(0);
        } catch (error) {
            toast.error('Error al cambiar categoría');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (formData.monto <= 0) {
            toast.error('El monto debe ser mayor a cero');
            return;
        }

        const fechaGasto = new Date(formData.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaGasto > hoy) {
            toast.error('No puedes registrar gastos con fecha futura');
            return;
        }

        try {
            if (editingId) {
                await updateGastoMutation.mutateAsync({ id: editingId, data: formData });
                toast.success('Gasto actualizado');
            } else {
                await createGastoMutation.mutateAsync(formData);
                toast.success('Gasto creado');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving gasto:', error);
            toast.error('Error al guardar gasto');
        }
    };

    const handleDelete = async (id: number) => {
        if (await confirm('¿Estás seguro de eliminar este gasto?')) {
            try {
                await deleteGastoMutation.mutateAsync(id);
                toast.success('Gasto eliminado');
            } catch (error) {
                console.error('Error deleting gasto:', error);
                toast.error('Error al eliminar gasto');
            }
        }
    };

    const handleEdit = (gasto: Gasto) => {
        setEditingId(gasto.id);
        setFormData({
            fecha: gasto.fecha.split('T')[0],
            categoriaId: gasto.categoriaId,
            tipo: gasto.tipo || 'Fijo',
            descripcion: gasto.descripcion ?? '',
            monto: gasto.monto,
            cuentaId: gasto.cuentaId ?? null,
            notas: gasto.notas ?? '',
            tagIds: gasto.tagIds || [],
        });
        setIsModalOpen(true);
    };

    const handleDuplicate = (gasto: Gasto) => {
        setEditingId(null);
        setFormData({
            fecha: new Date().toISOString().split('T')[0],
            categoriaId: gasto.categoriaId,
            tipo: gasto.tipo || 'Fijo',
            descripcion: gasto.descripcion ?? '',
            monto: gasto.monto,
            cuentaId: gasto.cuentaId ?? null,
            notas: gasto.notas ?? '',
            tagIds: gasto.tagIds || [],
        });
        setIsModalOpen(true);
        toast.info('Gasto duplicado. Ajusta los datos y guarda.');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            fecha: new Date().toISOString().split('T')[0],
            categoriaId: 0,
            tipo: 'Fijo',
            descripcion: '',
            monto: 0,
            cuentaId: null,
            tagIds: [],
        });
    };

    const formModalRef = useFocusTrap<HTMLDivElement>(isModalOpen, handleCloseModal);
    const transferModalRef = useFocusTrap<HTMLDivElement>(isTransferModalOpen, () => { setIsTransferModalOpen(false); setTransferData({ gastoOrigenId: 0, gastoDestinoId: 0, monto: 0 }); });
    const quickCatModalRef = useFocusTrap<HTMLDivElement>(isQuickCatModalOpen, () => { setIsQuickCatModalOpen(false); setNuevaCategoria({ nombre: '', tipo: 'Gasto' }); });
    const bulkCatModalRef = useFocusTrap<HTMLDivElement>(showBulkCatModal, () => { setShowBulkCatModal(false); setBulkCategoriaId(0); });

    const handleQuickCreateCategoria = async () => {
        if (!nuevaCategoria.nombre.trim()) {
            toast.error('El nombre de la categoría es requerido');
            return;
        }
        try {
            const newCat = await createCategoriaMutation.mutateAsync(nuevaCategoria);
            toast.success('Categoría creada');
            setFormData({ ...formData, categoriaId: newCat.id });
            setIsQuickCatModalOpen(false);
            setNuevaCategoria({ nombre: '', tipo: 'Gasto' });
        } catch (error) {
            console.error('Error creating categoria:', error);
            toast.error('Error al crear categoría');
        }
    };

    const isMutating = createGastoMutation.isPending || updateGastoMutation.isPending;

    const handleExportCSV = () => {
        const headers = ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Cuenta', 'Monto', 'Notas'];
        const rows = filteredGastos.map(g => [
            new Date(g.fecha.split('T')[0] + 'T12:00:00').toLocaleDateString(),
            g.descripcion || '',
            g.categoriaNombre || '',
            g.tipo || 'Variable',
            g.cuentaNombre || '',
            g.monto.toFixed(2),
            g.notas || '',
        ]);
        exportToCsv('gastos', headers, rows);
    };

    const handleTransferirSaldo = async () => {
        if (!transferData.gastoOrigenId || !transferData.gastoDestinoId || transferData.monto <= 0) return;
        try {
            await transferirSaldoMutation.mutateAsync(transferData);
            toast.success(`Saldo de $${transferData.monto.toFixed(2)} transferido exitosamente`);
            setIsTransferModalOpen(false);
            setTransferData({ gastoOrigenId: 0, gastoDestinoId: 0, monto: 0 });
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error?.response?.data || 'Error al transferir saldo');
        }
    };

    const gastoOrigenSeleccionado = useMemo(() => {
        if (!transferData.gastoOrigenId) return null;
        return (Array.isArray(gastos) ? gastos : []).find((g: Gasto) => g.id === transferData.gastoOrigenId) || null;
    }, [gastos, transferData.gastoOrigenId]);

    const disponibleOrigen = useMemo(() => {
        if (!gastoOrigenSeleccionado) return 0;
        return gastoOrigenSeleccionado.montoDisponible != null
            ? gastoOrigenSeleccionado.montoDisponible
            : gastoOrigenSeleccionado.monto;
    }, [gastoOrigenSeleccionado]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Gastos</h1>
                            <HelpTooltip content={sectionHelp.gastos} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Total: ${total.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setIsTransferModalOpen(true)}
                            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                            title="Transferir saldo entre gastos"
                        >
                            <ArrowLeftRight size={18} />
                            <span className="hidden sm:inline">Transferir</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                            title="Exportar a CSV"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Exportar</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">Nuevo gasto</span>
                            <span className="sm:hidden">Nuevo</span>
                        </button>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                aria-label="Buscar gastos"
                            />
                        </div>
                        <select
                            value={filterCategoria}
                            onChange={(e) => setFilterCategoria(e.target.value)}
                            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            aria-label="Filtrar por categoría"
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        {showFilters ? 'Ocultar' : 'Mostrar'} Filtros Avanzados
                    </button>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <AdvancedFiltersPanel
                        fechaDesde={fechaDesde}
                        onFechaDesde={setFechaDesde}
                        fechaHasta={fechaHasta}
                        onFechaHasta={setFechaHasta}
                        filterCategoria={filterCategoria}
                        onFilterCategoria={setFilterCategoria}
                        montoMin={montoMin}
                        onMontoMin={setMontoMin}
                        montoMax={montoMax}
                        onMontoMax={setMontoMax}
                        filterTagIds={filterTagIds}
                        onFilterTagIds={setFilterTagIds}
                        categorias={categorias}
                        resultCount={filteredGastos.length}
                        onClear={clearFilters}
                    />
                )}

                {isLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <TableSkeleton rows={10} columns={6} />
                    </div>
                ) : filteredGastos.length === 0 && !searchTerm && !filterCategoria ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <EmptyState content={emptyStates.gastos} onAction={() => setIsModalOpen(true)} />
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        {/* Bulk action bar */}
                        {selectedIds.size > 0 && (
                            <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{selectedIds.size} seleccionado(s)</span>
                                <button
                                    type="button"
                                    onClick={() => setShowBulkCatModal(true)}
                                    className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Cambiar categoría
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Eliminar seleccionados
                                </button>
                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
                                >
                                    <XCircle size={14} /> Cancelar
                                </button>
                            </div>
                        )}
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                                    <tr>
                                        <th className="px-3 py-3 w-10">
                                            <button type="button" onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Seleccionar todos">
                                                {selectedIds.size === paginatedGastos.length && paginatedGastos.length > 0 ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tags</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Categoría</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cuenta</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Monto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedGastos.map((gasto) => (
                                        <tr key={gasto.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedIds.has(gasto.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                            <td className="px-3 py-4">
                                                <button type="button" onClick={() => toggleSelect(gasto.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Seleccionar">
                                                    {selectedIds.has(gasto.id) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 dark:text-gray-300">
                                                <div>
                                                    <span>{gasto.descripcion}</span>
                                                    {gasto.notas && (
                                                        <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                            <FileText size={11} />
                                                            <span className="truncate max-w-[160px]">{gasto.notas}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {gasto.tagIds && gasto.tagIds.length > 0 ? (
                                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                                        {gasto.tagIds.length} tag{gasto.tagIds.length !== 1 ? 's' : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 dark:text-gray-300">{gasto.categoriaNombre || '-'}</td>
                                            <td className="px-6 py-4 dark:text-gray-300">
                                                <span className={`px-2 py-1 rounded-full text-xs ${gasto.tipo === 'Fijo' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                    }`}>
                                                    {gasto.tipo || 'Variable'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 dark:text-gray-300">
                                                {gasto.cuentaNombre ? (
                                                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">{gasto.cuentaNombre}</span>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="px-6 py-4 dark:text-gray-300">{new Date(gasto.fecha.split('T')[0] + 'T12:00:00').toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 min-w-[120px]">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold text-red-600">${gasto.monto.toFixed(2)}</span>
                                                        {gasto.cantidadDetalles != null && gasto.cantidadDetalles > 0 && gasto.montoDisponible != null && (
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${gasto.montoDisponible <= 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                                                                {gasto.montoDisponible <= 0 ? 'Agotado' : `$${gasto.montoDisponible.toFixed(2)} sin asignar`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {gasto.cantidadDetalles != null && gasto.cantidadDetalles > 0 && gasto.montoDisponible != null && (
                                                        (() => {
                                                            const usado = gasto.monto - gasto.montoDisponible;
                                                            const pct = Math.min(100, (usado / gasto.monto) * 100);
                                                            const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-green-500';
                                                            return (
                                                                <div className="w-full">
                                                                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{pct.toFixed(0)}% usado</p>
                                                                </div>
                                                            );
                                                        })()
                                                    )}
                                                    {gasto.transferencias && gasto.transferencias.length > 0 && (
                                                        <div className="mt-1 space-y-0.5">
                                                            {gasto.transferencias.map((t, i) => (
                                                                <p key={i} className="text-[10px]">
                                                                    {t.direccion === 'salida' ? (
                                                                        <><span className="text-red-500">-${t.monto.toFixed(2)}</span> <span className="text-gray-400">→ {t.otroGastoDescripcion}</span></>
                                                                    ) : (
                                                                        <><span className="text-green-500">+${t.monto.toFixed(2)}</span> <span className="text-gray-400">← {t.otroGastoDescripcion}</span></>
                                                                    )}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => setDetallesGastoId(gasto.id)} className="text-green-600 hover:text-green-800 dark:text-green-400" aria-label="Ver compras" title="Registrar compras">
                                                        <ShoppingCart size={18} />
                                                    </button>
                                                    <button onClick={() => handleDuplicate(gasto)} className="text-purple-600 hover:text-purple-800 dark:text-purple-400" aria-label="Duplicar" title="Duplicar gasto">
                                                        <Copy size={18} />
                                                    </button>
                                                    <button onClick={() => handleEdit(gasto)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400" aria-label="Editar">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(gasto.id)} className="text-red-600 hover:text-red-800 dark:text-red-400" aria-label="Eliminar">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedGastos.map((gasto) => (
                                <div key={gasto.id} className="p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium dark:text-white truncate">{gasto.descripcion}</p>
                                            {gasto.notas && (
                                                <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                                    <FileText size={11} className="shrink-0" />
                                                    <span className="truncate">{gasto.notas}</span>
                                                </p>
                                            )}
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{gasto.categoriaNombre || '-'}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${gasto.tipo === 'Fijo' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>
                                                    {gasto.tipo || 'Variable'}
                                                </span>
                                                {gasto.cuentaNombre && (
                                                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">{gasto.cuentaNombre}</span>
                                                )}
                                                {gasto.tagIds && gasto.tagIds.length > 0 && (
                                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                                        {gasto.tagIds.length} tag{gasto.tagIds.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-bold text-red-600 text-lg">${gasto.monto.toFixed(2)}</p>
                                            {gasto.cantidadDetalles != null && gasto.cantidadDetalles > 0 && gasto.montoDisponible != null && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${gasto.montoDisponible <= 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                                                    {gasto.montoDisponible <= 0 ? 'Agotado' : `$${gasto.montoDisponible.toFixed(2)} sin asignar`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {gasto.cantidadDetalles != null && gasto.cantidadDetalles > 0 && gasto.montoDisponible != null && (
                                        (() => {
                                            const usado = gasto.monto - gasto.montoDisponible;
                                            const pct = Math.min(100, (usado / gasto.monto) * 100);
                                            const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-green-500';
                                            return (
                                                <div className="w-full">
                                                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{pct.toFixed(0)}% usado · ${usado.toFixed(2)} de ${gasto.monto.toFixed(2)}</p>
                                                </div>
                                            );
                                        })()
                                    )}
                                    {gasto.transferencias && gasto.transferencias.length > 0 && (
                                        <div className="mt-1 space-y-0.5">
                                            {gasto.transferencias.map((t, i) => (
                                                <p key={i} className="text-[10px]">
                                                    {t.direccion === 'salida' ? (
                                                        <><span className="text-red-500">-${t.monto.toFixed(2)}</span> <span className="text-gray-400">→ {t.otroGastoDescripcion}</span></>
                                                    ) : (
                                                        <><span className="text-green-500">+${t.monto.toFixed(2)}</span> <span className="text-gray-400">← {t.otroGastoDescripcion}</span></>
                                                    )}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(gasto.fecha.split('T')[0] + 'T12:00:00').toLocaleDateString()}</span>
                                        <div className="flex gap-3">
                                            <button onClick={() => setDetallesGastoId(gasto.id)} className="text-green-600 dark:text-green-400 p-1" aria-label="Ver compras">
                                                <ShoppingCart size={18} />
                                            </button>
                                            <button onClick={() => handleDuplicate(gasto)} className="text-purple-600 dark:text-purple-400 p-1" aria-label="Duplicar" title="Duplicar gasto">
                                                <Copy size={18} />
                                            </button>
                                            <button onClick={() => handleEdit(gasto)} className="text-blue-600 dark:text-blue-400 p-1" aria-label="Editar">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(gasto.id)} className="text-red-600 dark:text-red-400 p-1" aria-label="Eliminar">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div ref={formModalRef} role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">{editingId ? 'Editar' : 'Nuevo'} gasto</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="gasto-descripcion" className="block text-sm font-medium mb-1 dark:text-gray-300">Descripcion (que compraste o pagaste)</label>
                                    <input
                                        id="gasto-descripcion"
                                        type="text"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ej: Almuerzo en restaurante, Gasolina, Netflix..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gasto-categoria" className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría</label>
                                    <div className="flex gap-2">
                                        <select
                                            id="gasto-categoria"
                                            value={formData.categoriaId}
                                            onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
                                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        >
                                            <option value="">Selecciona...</option>
                                            {categorias.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setIsQuickCatModalOpen(true)}
                                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            title="Crear nueva categoría"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="gasto-tipo" className="block text-sm font-medium mb-1 dark:text-gray-300">Tipo</label>
                                    <select
                                        id="gasto-tipo"
                                        value={formData.tipo || 'Fijo'}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    >
                                        <option value="Fijo">Fijo</option>
                                        <option value="Variable">Variable</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="gasto-fecha" className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label>
                                    <input
                                        id="gasto-fecha"
                                        type="date"
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gasto-monto" className="block text-sm font-medium mb-1 dark:text-gray-300">Monto (cuanto pagaste)</label>
                                    <input
                                        id="gasto-monto"
                                        type="number"
                                        step="0.01"
                                        value={formData.monto}
                                        onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>

                                {/* NUEVO: Selector de cuenta */}
                                <CuentaSelector
                                    value={formData.cuentaId}
                                    onChange={(id) => setFormData({ ...formData, cuentaId: id })}
                                    label="Cuenta (Opcional)"
                                    required={false}
                                />

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tags
                                    </label>
                                    <TagSelector
                                        selectedTagIds={formData.tagIds || []}
                                        onChange={(tagIds) => setFormData({ ...formData, tagIds })}
                                    />
                                </div>


                                {/* Adjuntos - solo mostrar cuando editando un gasto existente */}
                                {editingId && (
                                    <div className="border-t pt-4 mt-4">
                                        <AdjuntosList gastoId={editingId} />
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button type="submit" disabled={isMutating} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        Guardar
                                    </button>
                                    <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Detalles de Gasto (Sub-compras) */}
                {detallesGastoId && (
                    <DetallesGastoPanel
                        gastoId={detallesGastoId}
                        onClose={() => setDetallesGastoId(null)}
                    />
                )}

                {/* Modal Transferir Saldo */}
                {isTransferModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div ref={transferModalRef} role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                                <ArrowLeftRight size={20} /> Transferir Saldo entre Gastos
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Gasto Origen (de donde se toma)</label>
                                    <select
                                        aria-label="Gasto origen"
                                        value={transferData.gastoOrigenId}
                                        onChange={(e) => setTransferData({ ...transferData, gastoOrigenId: Number(e.target.value), monto: 0 })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value={0}>Seleccionar gasto origen...</option>
                                        {(Array.isArray(gastos) ? gastos : [])
                                            .filter((g: Gasto) => {
                                                const disp = g.montoDisponible != null ? g.montoDisponible : g.monto;
                                                return disp > 0;
                                            })
                                            .map((g: Gasto) => {
                                                const disp = g.montoDisponible != null ? g.montoDisponible : g.monto;
                                                return (
                                                    <option key={g.id} value={g.id}>
                                                        {g.descripcion || g.categoriaNombre || `Gasto #${g.id}`} — ${disp.toFixed(2)} disponible
                                                    </option>
                                                );
                                            })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Gasto Destino (a donde se envía)</label>
                                    <select
                                        aria-label="Gasto destino"
                                        value={transferData.gastoDestinoId}
                                        onChange={(e) => setTransferData({ ...transferData, gastoDestinoId: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value={0}>Seleccionar gasto destino...</option>
                                        {(Array.isArray(gastos) ? gastos : [])
                                            .filter((g: Gasto) => g.id !== transferData.gastoOrigenId)
                                            .map((g: Gasto) => (
                                                <option key={g.id} value={g.id}>
                                                    {g.descripcion || g.categoriaNombre || `Gasto #${g.id}`} — Monto actual: ${g.monto.toFixed(2)}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Monto a transferir
                                        {gastoOrigenSeleccionado && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                (Disponible: ${disponibleOrigen.toFixed(2)})
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={disponibleOrigen}
                                        value={transferData.monto || ''}
                                        onChange={(e) => setTransferData({ ...transferData, monto: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="0.00"
                                    />
                                    {transferData.monto > disponibleOrigen && disponibleOrigen > 0 && (
                                        <p className="text-xs text-red-500 mt-1">El monto excede el disponible del gasto origen.</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleTransferirSaldo}
                                        disabled={!transferData.gastoOrigenId || !transferData.gastoDestinoId || transferData.monto <= 0 || transferData.monto > disponibleOrigen}
                                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Transferir
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsTransferModalOpen(false); setTransferData({ gastoOrigenId: 0, gastoDestinoId: 0, monto: 0 }); }}
                                        className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Create Categoria Modal */}
                {isQuickCatModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div ref={quickCatModalRef} role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-4 dark:text-white">➕ Nueva categoría rápida</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre</label>
                                    <input
                                        type="text"
                                        value={nuevaCategoria.nombre}
                                        onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ej: Alimentación" autoFocus
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleQuickCreateCategoria}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                    >
                                        Crear
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsQuickCatModalOpen(false); setNuevaCategoria({ nombre: '', tipo: 'Gasto' }); }}
                                        className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Change Category Modal */}
                {showBulkCatModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div ref={bulkCatModalRef} role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
                            <h3 className="text-lg font-bold mb-4 dark:text-white">Cambiar categoría ({selectedIds.size} gastos)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nueva categoría</label>
                                    <select
                                        aria-label="Nueva categoría"
                                        value={bulkCategoriaId}
                                        onChange={(e) => setBulkCategoriaId(Number(e.target.value))}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value={0}>Seleccionar...</option>
                                        {categorias.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleBulkChangeCategory}
                                        disabled={!bulkCategoriaId}
                                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Aplicar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowBulkCatModal(false); setBulkCategoriaId(0); }}
                                        className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
