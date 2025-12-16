import { useState, useEffect, useMemo, useRef } from 'react';
import { presupuestosService, type Presupuesto, type CreatePresupuestoDto } from '../services/presupuestosService';
import { categoriasService, type Categoria } from '../services/categoriasService';
import { Trash2, Plus, Edit2, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'react-toastify';

export const PresupuestosPage = () => {
    const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<CreatePresupuestoDto>({
        categoriaId: 0,
        montoLimite: 0,
        periodo: 'Mensual',
        mesAplicable: new Date().getMonth() + 1,
        anoAplicable: new Date().getFullYear(),
    });
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadPresupuestos();
            loadCategorias();
        }
    }, []);

    const loadPresupuestos = async () => {
        try {
            const data = await presupuestosService.getAll();
            setPresupuestos(data);
        } catch (error) {
            console.error('Error loading presupuestos:', error);
            toast.error('Error al cargar presupuestos');
        }
    };

    const loadCategorias = async () => {
        try {
            const data = await categoriasService.getAll();
            setCategorias(data.filter(c => c.tipo === 'Gasto'));
        } catch (error) {
            console.error('Error loading categorias:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await presupuestosService.update(editingId, formData);
                toast.success('Presupuesto actualizado');
            } else {
                await presupuestosService.create(formData);
                toast.success('Presupuesto creado');
            }
            loadPresupuestos();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving presupuesto:', error);
            toast.error('Error al guardar presupuesto');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
            try {
                await presupuestosService.delete(id);
                toast.success('Presupuesto eliminado');
                loadPresupuestos();
            } catch (error) {
                console.error('Error deleting presupuesto:', error);
                toast.error('Error al eliminar presupuesto');
            }
        }
    };

    const handleEdit = (presupuesto: Presupuesto) => {
        setEditingId(presupuesto.id);
        setFormData({
            categoriaId: presupuesto.categoriaId,
            montoLimite: presupuesto.montoLimite,
            periodo: presupuesto.periodo,
            mesAplicable: presupuesto.mesAplicable,
            anoAplicable: presupuesto.anoAplicable,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            categoriaId: 0,
            montoLimite: 0,
            periodo: 'Mensual',
            mesAplicable: new Date().getMonth() + 1,
            anoAplicable: new Date().getFullYear(),
        });
    };

    const getAlertLevel = (porcentaje: number) => {
        if (porcentaje >= 100) return 'danger';
        if (porcentaje >= 80) return 'warning';
        return 'normal';
    };

    const getAlertColor = (level: string) => {
        switch (level) {
            case 'danger': return 'bg-red-500';
            case 'warning': return 'bg-orange-500';
            default: return 'bg-green-500';
        }
    };

    const filteredPresupuestos = useMemo(() => {
        if (!Array.isArray(presupuestos)) return [];
        return presupuestos.filter(p =>
            p.categoriaNombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [presupuestos, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">💼 Presupuestos</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {new Date().toLocaleString('es', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nuevo Presupuesto
                    </button>
                </div>

                {/* Búsqueda */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPresupuestos.map((presupuesto) => {
                        const alertLevel = getAlertLevel(presupuesto.porcentajeUtilizado);

                        return (
                            <div key={presupuesto.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                {/* Header con alerta */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{presupuesto.categoriaNombre}</h3>
                                        {alertLevel === 'danger' && (
                                            <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                                                <AlertTriangle size={16} />
                                                <span>¡Límite excedido!</span>
                                            </div>
                                        )}
                                        {alertLevel === 'warning' && (
                                            <div className="flex items-center gap-1 text-orange-600 text-sm mt-1">
                                                <AlertTriangle size={16} />
                                                <span>Cerca del límite</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(presupuesto)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(presupuesto.id)} className="text-red-600 hover:text-red-800 dark:text-red-400">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Barra de progreso */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <span>{presupuesto.porcentajeUtilizado.toFixed(1)}% usado</span>
                                        <span className="font-semibold dark:text-white">${presupuesto.gastadoActual.toFixed(2)} / ${presupuesto.montoLimite.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${getAlertColor(alertLevel)}`}
                                            style={{ width: `${Math.min(presupuesto.porcentajeUtilizado, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Detalles */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Disponible:</span>
                                        <span className={`font-semibold ${presupuesto.disponible < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ${presupuesto.disponible.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Período:</span>
                                        <span className="font-medium dark:text-white">{presupuesto.periodo}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Modal crear/editar */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">{editingId ? 'Editar' : 'Nuevo'} Presupuesto</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría</label>
                                    <select
                                        value={formData.categoriaId}
                                        onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    >
                                        <option value="">Selecciona...</option>
                                        {categorias.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Límite de Gasto</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.montoLimite}
                                        onChange={(e) => setFormData({ ...formData, montoLimite: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Período</label>
                                    <select
                                        value={formData.periodo}
                                        onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    >
                                        <option value="Mensual">Mensual</option>
                                        <option value="Anual">Anual</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Mes</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            value={formData.mesAplicable}
                                            onChange={(e) => setFormData({ ...formData, mesAplicable: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Año</label>
                                        <input
                                            type="number"
                                            value={formData.anoAplicable}
                                            onChange={(e) => setFormData({ ...formData, anoAplicable: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                    </div>
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
