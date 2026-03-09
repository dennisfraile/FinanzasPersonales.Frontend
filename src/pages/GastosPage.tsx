import { useState, useMemo } from 'react';
import { type Gasto, type CreateGastoDto } from '../services/gastosService';
import { type Categoria } from '../services/categoriasService';
import { Trash2, Plus, Edit2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { Pagination } from '../components/Pagination';
import { CuentaSelector } from '../components/CuentaSelector';
import { AdjuntosList } from '../components/AdjuntosList';
import { TableSkeleton } from '../components/Skeleton';
import { TagSelector } from '../components/TagSelector';
import { useGastos, useCreateGasto, useUpdateGasto, useDeleteGasto, useCategorias, useCreateCategoria } from '../hooks/useQueryHooks';

const ITEMS_PER_PAGE = 10;

export const GastosPage = () => {
    const { data: gastos = [], isLoading } = useGastos();
    const { data: allCategorias = [] } = useCategorias();
    const categorias = useMemo(() => allCategorias.filter((c: Categoria) => c.tipo === 'Gasto'), [allCategorias]);

    const createGastoMutation = useCreateGasto();
    const updateGastoMutation = useUpdateGasto();
    const deleteGastoMutation = useDeleteGasto();
    const createCategoriaMutation = useCreateCategoria();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    // Advanced filters
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [montoMin, setMontoMin] = useState('');
    const [montoMax, setMontoMax] = useState('');
    const [filterTagIds, setFilterTagIds] = useState<number[]>([]);
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
        if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
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
        });
        setIsModalOpen(true);
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
        });
    };

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

    // Filtrado y búsqueda con filtros avanzados
    const filteredGastos = useMemo(() => {
        if (!Array.isArray(gastos)) return [];
        return gastos.filter(gasto => {
            const matchesSearch = (gasto.descripcion ?? '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategoria = !filterCategoria || gasto.categoriaId.toString() === filterCategoria;

            // Filtros avanzados
            const matchesFechaDesde = !fechaDesde || gasto.fecha >= fechaDesde;
            const matchesFechaHasta = !fechaHasta || gasto.fecha <= fechaHasta;
            const matchesMontoMin = !montoMin || gasto.monto >= parseFloat(montoMin);
            const matchesMontoMax = !montoMax || gasto.monto <= parseFloat(montoMax);

            return matchesSearch && matchesCategoria && matchesFechaDesde && matchesFechaHasta &&
                matchesMontoMin && matchesMontoMax;
        });
    }, [gastos, searchTerm, filterCategoria, fechaDesde, fechaHasta, montoMin, montoMax]);

    // Paginación
    const totalPages = Math.ceil(filteredGastos.length / ITEMS_PER_PAGE);
    const paginatedGastos = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredGastos.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredGastos, currentPage]);

    const total = filteredGastos.reduce((sum, g) => sum + g.monto, 0);

    const isMutating = createGastoMutation.isPending || updateGastoMutation.isPending;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">💸 Gastos</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Total: ${total.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nuevo Gasto
                    </button>
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
                            />
                        </div>
                        <select
                            value={filterCategoria}
                            onChange={(e) => setFilterCategoria(e.target.value)}
                            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold dark:text-white">Filtros Avanzados</h3>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha Desde</label>
                                <input
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha Hasta</label>
                                <input
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría</label>
                                <select
                                    value={filterCategoria}
                                    onChange={(e) => setFilterCategoria(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Todas</option>
                                    {categorias.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto Mínimo</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={montoMin}
                                    onChange={(e) => setMontoMin(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto Máximo</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={montoMax}
                                    onChange={(e) => setMontoMax(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Tags Filter */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Filtrar por Tags</label>
                                <TagSelector
                                    selectedTagIds={filterTagIds}
                                    onChange={setFilterTagIds}
                                />
                            </div>

                            <div className="flex items-end">
                                <div className="text-sm dark:text-gray-300">
                                    <strong>{filteredGastos.length}</strong> resultados
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <TableSkeleton rows={10} columns={6} />
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tags</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Categoría</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Monto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedGastos.map((gasto) => (
                                    <tr key={gasto.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 dark:text-gray-300">{gasto.descripcion}</td>
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
                                        <td className="px-6 py-4 dark:text-gray-300">{new Date(gasto.fecha).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-semibold text-red-600">${gasto.monto.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(gasto)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(gasto.id)} className="text-red-600 hover:text-red-800 dark:text-red-400">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">{editingId ? 'Editar' : 'Nuevo'} Gasto</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
                                    <input
                                        type="text"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría</label>
                                    <div className="flex gap-2">
                                        <select
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
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tipo</label>
                                    <select
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
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label>
                                    <input
                                        type="date"
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto</label>
                                    <input
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

                {/* Quick Create Categoria Modal */}
                {isQuickCatModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
                            <h3 className="text-xl font-bold mb-4 dark:text-white">➕ Nueva Categoría Rápida</h3>
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
            </div>
        </div>
    );
};
