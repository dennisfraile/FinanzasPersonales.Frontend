import { useState, useMemo } from 'react';
import { type Categoria, type CreateCategoriaDto } from '../services/categoriasService';
import { Trash2, Plus, Edit2, Search, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from '../hooks/useQueryHooks';

export const CategoriasPage = () => {
    const { data: categorias = [] } = useCategorias();
    const createCategoriaMutation = useCreateCategoria();
    const updateCategoriaMutation = useUpdateCategoria();
    const deleteCategoriaMutation = useDeleteCategoria();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [formData, setFormData] = useState<CreateCategoriaDto>({
        nombre: '',
        tipo: 'Gasto',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCategoriaMutation.mutateAsync({ id: editingId, data: formData });
                toast.success('Categoría actualizada');
            } else {
                await createCategoriaMutation.mutateAsync(formData);
                toast.success('Categoría creada');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving categoria:', error);
            toast.error('Error al guardar categoría');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
            try {
                await deleteCategoriaMutation.mutateAsync(id);
                toast.success('Categoría eliminada');
            } catch (error) {
                console.error('Error deleting categoria:', error);
                toast.error('Error al eliminar categoría');
            }
        }
    };

    const handleEdit = (categoria: Categoria) => {
        setEditingId(categoria.id);
        setFormData({
            nombre: categoria.nombre,
            tipo: categoria.tipo,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            nombre: '',
            tipo: 'Gasto',
        });
    };

    const filteredCategorias = useMemo(() => {
        if (!Array.isArray(categorias)) return [];
        return categorias.filter(cat => {
            const matchesSearch = cat.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTipo = !filterTipo || cat.tipo === filterTipo;
            return matchesSearch && matchesTipo;
        });
    }, [categorias, searchTerm, filterTipo]);

    const categoriasGasto = filteredCategorias.filter(c => c.tipo === 'Gasto');
    const categoriasIngreso = filteredCategorias.filter(c => c.tipo === 'Ingreso');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">🏷️ Categorías</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{filteredCategorias.length} categorías</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nueva Categoría
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar categorías..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <select
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="Gasto">Gastos</option>
                            <option value="Ingreso">Ingresos</option>
                        </select>
                    </div>
                </div>

                {/* Categorías de Gasto */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">💸</span>
                        Categorías de Gastos ({categoriasGasto.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoriasGasto.map(cat => (
                            <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Tag size={20} className="text-red-500" />
                                    <span className="font-medium dark:text-white">{cat.nombre}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800 dark:text-red-400">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {categoriasGasto.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay categorías de gastos</p>
                    )}
                </div>

                {/* Categorías de Ingreso */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">💰</span>
                        Categorías de Ingresos ({categoriasIngreso.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoriasIngreso.map(cat => (
                            <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Tag size={20} className="text-green-500" />
                                    <span className="font-medium dark:text-white">{cat.nombre}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800 dark:text-red-400">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {categoriasIngreso.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay categorías de ingresos</p>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">{editingId ? 'Editar' : 'Nueva'} Categoría</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ej: Alimentación, Transporte..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tipo</label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    >
                                        <option value="Gasto">Gasto</option>
                                        <option value="Ingreso">Ingreso</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
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
            </div>
        </div>
    );
};
