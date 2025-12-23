import { useState, useEffect, useMemo } from 'react';
import { ingresosService, type Ingreso, type CreateIngresoDto } from '../services/ingresosService';
import { categoriasService, type Categoria } from '../services/categoriasService';
import { Trash2, Plus, Edit2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { Pagination } from '../components/Pagination';
import { CuentaSelector } from '../components/CuentaSelector';

const ITEMS_PER_PAGE = 10;

export const IngresosPage = () => {
    const [ingresos, setIngresos] = useState<Ingreso[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState<CreateIngresoDto>({
        fecha: new Date().toISOString().split('T')[0],
        categoriaId: 0,
        descripcion: '',
        monto: 0,
        cuentaId: null,
    });
    const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', tipo: 'Ingreso' });

    useEffect(() => {
        loadIngresos();
        loadCategorias();
    }, []);

    const loadIngresos = async () => {
        try {
            const data = await ingresosService.getAll();
            setIngresos(data);
        } catch (error) {
            console.error('Error loading ingresos:', error);
            toast.error('Error al cargar ingresos');
        }
    };

    const loadCategorias = async () => {
        try {
            const data = await categoriasService.getAll();
            setCategorias(data.filter(c => c.tipo === 'Ingreso'));
        } catch (error) {
            console.error('Error loading categorias:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await ingresosService.update(editingId, formData);
                toast.success('Ingreso actualizado');
            } else {
                await ingresosService.create(formData);
                toast.success('Ingreso creado');
            }
            loadIngresos();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving ingreso:', error);
            toast.error('Error al guardar ingreso');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este ingreso?')) {
            try {
                await ingresosService.delete(id);
                toast.success('Ingreso eliminado');
                loadIngresos();
            } catch (error) {
                console.error('Error deleting ingreso:', error);
                toast.error('Error al eliminar ingreso');
            }
        }
    };

    const handleEdit = (ingreso: Ingreso) => {
        setEditingId(ingreso.id);
        setFormData({
            fecha: ingreso.fecha.split('T')[0],
            categoriaId: ingreso.categoriaId,
            descripcion: ingreso.descripcion ?? '',
            monto: ingreso.monto,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            fecha: new Date().toISOString().split('T')[0],
            categoriaId: 0,
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
            const newCat = await categoriasService.create(nuevaCategoria);
            toast.success('Categoría creada');
            await loadCategorias();
            setFormData({ ...formData, categoriaId: newCat.id });
            setIsQuickCatModalOpen(false);
            setNuevaCategoria({ nombre: '', tipo: 'Ingreso' });
        } catch (error) {
            console.error('Error creating categoria:', error);
            toast.error('Error al crear categoría');
        }
    };

    const filteredIngresos = useMemo(() => {
        if (!Array.isArray(ingresos)) return [];
        return ingresos.filter(ingreso => {
            const matchesSearch = !searchTerm ||
                ingreso.monto.toString().includes(searchTerm) ||
                (ingreso.categoriaNombre ?? '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategoria = !filterCategoria || ingreso.categoriaId.toString() === filterCategoria;
            return matchesSearch && matchesCategoria;
        });
    }, [ingresos, searchTerm, filterCategoria]);

    const totalPages = Math.ceil(filteredIngresos.length / ITEMS_PER_PAGE);
    const paginatedIngresos = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredIngresos.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredIngresos, currentPage]);

    const total = filteredIngresos.reduce((sum, i) => sum + i.monto, 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">💰 Ingresos</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Total: ${total.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nuevo Ingreso
                    </button>
                </div>

                {/* Filtros */}
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
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedIngresos.map((ingreso) => (
                                <tr key={ingreso.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 dark:text-gray-300">{ingreso.descripcion || '-'}</td>
                                    <td className="px-6 py-4 dark:text-gray-300">{ingreso.categoriaNombre || '-'}</td>
                                    <td className="px-6 py-4 dark:text-gray-300">{new Date(ingreso.fecha).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-semibold text-green-600">${ingreso.monto.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(ingreso)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(ingreso.id)} className="text-red-600 hover:text-red-800 dark:text-red-400">
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

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">{editingId ? 'Editar' : 'Nuevo'} Ingreso</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
                                    <input
                                        type="text"
                                        value={formData.descripcion || ''}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
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

                                <CuentaSelector
                                    value={formData.cuentaId}
                                    onChange={(id) => setFormData({ ...formData, cuentaId: id })}
                                    label="Cuenta (Opcional)"
                                    required={false}
                                />

                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                                        Guardar
                                    </button>
                                    <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div >
                )}

                {/* Quick Create Categoria Modal */}
                {
                    isQuickCatModalOpen && (
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
                                            placeholder="Ej: Salario, Freelance..."
                                            autoFocus
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
                                            onClick={() => { setIsQuickCatModalOpen(false); setNuevaCategoria({ nombre: '', tipo: 'Ingreso' }); }}
                                            className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};
