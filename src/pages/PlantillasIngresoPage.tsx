import { useState, useMemo } from 'react';
import { type PlantillaIngreso, type CreatePlantillaIngresoDto } from '../services/plantillasIngresoService';
import { Trash2, Plus, Edit2, Search, Zap, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import HelpTooltip from '../components/HelpTooltip';
import { sectionHelp } from '../utils/helpContent';
import { CuentaSelector } from '../components/CuentaSelector';
import { usePlantillasIngreso, useCreatePlantillaIngreso, useUpdatePlantillaIngreso, useDeletePlantillaIngreso, useUsarPlantillaIngreso, useCategorias } from '../hooks/useQueryHooks';

export const PlantillasIngresoPage = () => {
    const { data: plantillas = [], isLoading } = usePlantillasIngreso();
    const { data: categorias = [] } = useCategorias();
    const createMutation = useCreatePlantillaIngreso();
    const updateMutation = useUpdatePlantillaIngreso();
    const deleteMutation = useDeletePlantillaIngreso();
    const usarMutation = useUsarPlantillaIngreso();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUsarModalOpen, setIsUsarModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedPlantillaId, setSelectedPlantillaId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [usarData, setUsarData] = useState({ fecha: new Date().toISOString().split('T')[0], monto: 0 as number | null });

    const [formData, setFormData] = useState<CreatePlantillaIngresoDto>({
        nombre: '',
        categoriaId: 0,
        monto: null,
        descripcion: '',
        cuentaId: null,
        icono: '',
        color: '',
        ordenDisplay: 0,
    });

    const ingresoCategorias = useMemo(() => categorias.filter((c: any) => c.tipo === 'Ingreso'), [categorias]);

    const filteredPlantillas = useMemo(() => {
        if (!Array.isArray(plantillas)) return [];
        return plantillas.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [plantillas, searchTerm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.categoriaId) { toast.error('Selecciona una categoría'); return; }
        try {
            if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, data: { id: editingId, ...formData } });
                toast.success('Plantilla actualizada');
            } else {
                await createMutation.mutateAsync(formData);
                toast.success('Plantilla creada');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al guardar plantilla');
        }
    };

    const handleUsar = async () => {
        if (!selectedPlantillaId) return;
        try {
            await usarMutation.mutateAsync({
                id: selectedPlantillaId,
                data: { fecha: usarData.fecha, monto: usarData.monto ?? undefined },
            });
            toast.success('Ingreso creado desde plantilla');
            setIsUsarModalOpen(false);
            setSelectedPlantillaId(null);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al usar plantilla');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Eliminar esta plantilla?')) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('Plantilla eliminada');
            } catch (error) { toast.error('Error al eliminar'); }
        }
    };

    const handleEdit = (p: PlantillaIngreso) => {
        setEditingId(p.id);
        setFormData({
            nombre: p.nombre, categoriaId: p.categoriaId, monto: p.monto,
            descripcion: p.descripcion, cuentaId: p.cuentaId,
            icono: p.icono, color: p.color, ordenDisplay: p.ordenDisplay,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ nombre: '', categoriaId: 0, monto: null, descripcion: '', cuentaId: null, icono: '', color: '', ordenDisplay: 0 });
    };

    const openUsarModal = (p: PlantillaIngreso) => {
        setSelectedPlantillaId(p.id);
        setUsarData({ fecha: new Date().toISOString().split('T')[0], monto: p.monto ?? null });
        setIsUsarModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">Plantillas de ingreso <HelpTooltip content={sectionHelp.plantillas} /></h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Crea ingresos frecuentes con un clic</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <Plus size={20} /> Nueva plantilla
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Buscar plantillas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" /></div>)}
                    </div>
                ) : filteredPlantillas.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                        <Copy size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{searchTerm ? 'Sin resultados' : 'No tienes plantillas'}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Crea plantillas para ingresos que registras frecuentemente</p>
                        {!searchTerm && <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"><Plus size={18} className="inline mr-1" /> Crear primera plantilla</button>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPlantillas.map((p) => (
                            <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-800 dark:text-white truncate">{p.nombre}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.categoriaNombre}</p>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <button onClick={() => handleEdit(p)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 p-1"><Edit2 size={15} /></button>
                                        <button onClick={() => handleDelete(p.id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 p-1"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                                {p.monto && <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">${p.monto.toFixed(2)}</p>}
                                {p.descripcion && <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-3">{p.descripcion}</p>}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Usada {p.vecesUsada} veces</span>
                                    <button onClick={() => openUsarModal(p)} className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 flex items-center gap-1 text-sm font-medium">
                                        <Zap size={14} /> Usar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal crear/editar */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">{editingId ? 'Editar' : 'Nueva'} plantilla</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre</label>
                                    <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ej: Salario mensual" required maxLength={100} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría</label>
                                    <select value={formData.categoriaId} onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                        <option value={0}>Seleccionar...</option>
                                        {ingresoCategorias.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto (opcional)</label>
                                    <input type="number" step="0.01" min="0.01" value={formData.monto || ''} onChange={(e) => setFormData({ ...formData, monto: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción (opcional)</label>
                                    <input type="text" value={formData.descripcion || ''} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value || '' })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Descripción..." maxLength={250} />
                                </div>
                                <CuentaSelector value={formData.cuentaId} onChange={(id) => setFormData({ ...formData, cuentaId: id })} label="Cuenta (opcional)" required={false} />
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Guardar</button>
                                    <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal usar plantilla */}
                {isUsarModalOpen && selectedPlantillaId && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">Usar plantilla</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label>
                                    <input type="date" value={usarData.fecha} onChange={(e) => setUsarData({ ...usarData, fecha: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto (dejar vacío para usar el de la plantilla)</label>
                                    <input type="number" step="0.01" min="0.01" value={usarData.monto || ''} onChange={(e) => setUsarData({ ...usarData, monto: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleUsar} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Crear ingreso</button>
                                    <button onClick={() => setIsUsarModalOpen(false)} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
