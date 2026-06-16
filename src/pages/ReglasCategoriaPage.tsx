import { useState, useMemo } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { type ReglaCategoria, type CreateReglaCategoriaDto } from '../services/reglasCategoriaService';
import { Trash2, Plus, Edit2, Search, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import HelpTooltip from '../components/HelpTooltip';
import { useConfirm } from '../context/ConfirmContext';
import { sectionHelp } from '../utils/helpContent';
import { useReglasCategoria, useCreateReglaCategoria, useUpdateReglaCategoria, useDeleteReglaCategoria, useCategorias } from '../hooks/useQueryHooks';

const TIPOS_COINCIDENCIA = [
    { value: 'Contiene', label: 'Contiene' },
    { value: 'Exacto', label: 'Exacto' },
    { value: 'ComienzaCon', label: 'Comienza con' },
];

const TIPOS_TRANSACCION = [
    { value: 'Gasto', label: 'Gasto' },
    { value: 'Ingreso', label: 'Ingreso' },
    { value: 'Ambos', label: 'Ambos' },
];

export const ReglasCategoriaPage = () => {
    const { data: reglas = [], isLoading } = useReglasCategoria();
    const { data: categorias = [] } = useCategorias();
    const createMutation = useCreateReglaCategoria();
    const updateMutation = useUpdateReglaCategoria();
    const deleteMutation = useDeleteReglaCategoria();
    const confirm = useConfirm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<CreateReglaCategoriaDto>({
        patron: '',
        tipoCoincidencia: 'Contiene',
        categoriaId: 0,
        tipoTransaccion: 'Gasto',
        prioridad: 0,
    });

    const filteredReglas = useMemo(() => {
        if (!Array.isArray(reglas)) return [];
        return reglas.filter(r =>
            r.patron.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.categoriaNombre || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reglas, searchTerm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.categoriaId) { toast.error('Selecciona una categoría'); return; }
        try {
            if (editingId) {
                const regla = reglas.find(r => r.id === editingId);
                await updateMutation.mutateAsync({ id: editingId, data: { id: editingId, ...formData, activa: regla?.activa ?? true } });
                toast.success('Regla actualizada');
            } else {
                await createMutation.mutateAsync(formData);
                toast.success('Regla creada');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al guardar regla');
        }
    };

    const handleToggleActiva = async (regla: ReglaCategoria) => {
        try {
            await updateMutation.mutateAsync({
                id: regla.id,
                data: {
                    id: regla.id,
                    patron: regla.patron,
                    tipoCoincidencia: regla.tipoCoincidencia,
                    categoriaId: regla.categoriaId,
                    tipoTransaccion: regla.tipoTransaccion,
                    prioridad: regla.prioridad,
                    activa: !regla.activa,
                },
            });
            toast.success(regla.activa ? 'Regla desactivada' : 'Regla activada');
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    const handleDelete = async (id: number) => {
        if (await confirm('¿Eliminar esta regla?')) {
            try { await deleteMutation.mutateAsync(id); toast.success('Regla eliminada'); }
            catch { toast.error('Error al eliminar'); }
        }
    };

    const handleEdit = (r: ReglaCategoria) => {
        setEditingId(r.id);
        setFormData({ patron: r.patron, tipoCoincidencia: r.tipoCoincidencia, categoriaId: r.categoriaId, tipoTransaccion: r.tipoTransaccion, prioridad: r.prioridad });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ patron: '', tipoCoincidencia: 'Contiene', categoriaId: 0, tipoTransaccion: 'Gasto', prioridad: 0 });
    };

    const modalRef = useFocusTrap<HTMLDivElement>(isModalOpen, handleCloseModal);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">Reglas de auto-categorización <HelpTooltip content={sectionHelp.reglasCategoria} /></h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Asigna categorías automáticamente según la descripción</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 flex items-center gap-2">
                        <Plus size={20} /> Nueva regla
                    </button>
                </div>

                {/* Explicación */}
                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4 mb-6">
                    <p className="text-sm text-violet-800 dark:text-violet-300">
                        Las reglas asignan categorías automáticamente al importar CSV o al sugerir categorías. Si la descripción de una transacción coincide con el patrón, se asigna la categoría configurada.
                    </p>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Buscar por patrón o categoría..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" /></div>)}
                    </div>
                ) : filteredReglas.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                        <Zap size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{searchTerm ? 'Sin resultados' : 'No tienes reglas configuradas'}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Crea reglas para categorizar automáticamente tus transacciones</p>
                        {!searchTerm && <button onClick={() => setIsModalOpen(true)} className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"><Plus size={18} className="inline mr-1" /> Crear primera regla</button>}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredReglas.map((regla) => (
                            <div key={regla.id} className={`p-4 flex items-center gap-4 ${!regla.activa ? 'opacity-50' : ''}`}>
                                <button onClick={() => handleToggleActiva(regla)} className="shrink-0" title={regla.activa ? 'Desactivar' : 'Activar'}>
                                    {regla.activa ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-gray-400" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium dark:text-white">"{regla.patron}"</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">{regla.tipoCoincidencia}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">{regla.tipoTransaccion}</span>
                                        {regla.prioridad > 0 && <span className="text-xs text-gray-400">P:{regla.prioridad}</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">→ {regla.categoriaNombre}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(regla)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 p-1"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(regla.id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 p-1"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div ref={modalRef} role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">{editingId ? 'Editar' : 'Nueva'} regla</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Patrón de texto</label>
                                    <input type="text" value={formData.patron} onChange={(e) => setFormData({ ...formData, patron: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ej: Uber, Netflix, Supermercado" required maxLength={200} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tipo de coincidencia</label>
                                        <select value={formData.tipoCoincidencia} onChange={(e) => setFormData({ ...formData, tipoCoincidencia: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            {TIPOS_COINCIDENCIA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Aplica a</label>
                                        <select value={formData.tipoTransaccion} onChange={(e) => setFormData({ ...formData, tipoTransaccion: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            {TIPOS_TRANSACCION.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría a asignar</label>
                                    <select value={formData.categoriaId} onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                        <option value={0}>Seleccionar...</option>
                                        {categorias.map((c: any) => <option key={c.id} value={c.id}>{c.nombre} ({c.tipo})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Prioridad (mayor = más importante)</label>
                                    <input type="number" min="0" value={formData.prioridad} onChange={(e) => setFormData({ ...formData, prioridad: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700">Guardar</button>
                                    <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
