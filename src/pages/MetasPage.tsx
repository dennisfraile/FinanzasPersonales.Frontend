import { useState, useMemo } from 'react';
import { type Meta, type CreateMetaDto } from '../services/metasService';
import { Trash2, Plus, Edit2, DollarSign, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { CuentaSelector } from '../components/CuentaSelector';
import { useMetas, useCreateMeta, useUpdateMeta, useDeleteMeta, useAbonarMeta } from '../hooks/useQueryHooks';
import HelpTooltip from '../components/HelpTooltip';
import EmptyState from '../components/EmptyState';
import { sectionHelp, emptyStates } from '../utils/helpContent';

export const MetasPage = () => {
    const { data: metas = [] } = useMetas();
    const createMetaMutation = useCreateMeta();
    const updateMetaMutation = useUpdateMeta();
    const deleteMetaMutation = useDeleteMeta();
    const abonarMetaMutation = useAbonarMeta();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
    const [selectedMetaId, setSelectedMetaId] = useState<number | null>(null);
    const [montoAbono, setMontoAbono] = useState(0);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<CreateMetaDto>({
        metas: '',
        montoTotal: 0,
        ahorroActual: 0,
        montoRestante: 0,
        cuentaId: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                montoRestante: formData.montoTotal - formData.ahorroActual,
            };

            if (editingId) {
                await updateMetaMutation.mutateAsync({ id: editingId, data: dataToSend });
                toast.success('Meta actualizada');
            } else {
                await createMetaMutation.mutateAsync(dataToSend);
                toast.success('Meta creada');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving meta:', error);
            toast.error('Error al guardar meta');
        }
    };

    const handleAbonar = async () => {
        if (selectedMetaId && montoAbono > 0) {
            try {
                await abonarMetaMutation.mutateAsync({ id: selectedMetaId, monto: montoAbono });
                toast.success(`Abono de $${montoAbono.toFixed(2)} realizado`);
                setIsAbonoModalOpen(false);
                setMontoAbono(0);
                setSelectedMetaId(null);
            } catch (error) {
                console.error('Error abonando:', error);
                toast.error('Error al realizar abono');
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar esta meta?')) {
            try {
                await deleteMetaMutation.mutateAsync(id);
                toast.success('Meta eliminada');
            } catch (error) {
                console.error('Error deleting meta:', error);
                toast.error('Error al eliminar meta');
            }
        }
    };

    const handleEdit = (meta: Meta) => {
        setEditingId(meta.id);
        setFormData({
            metas: meta.metas,
            montoTotal: meta.montoTotal,
            ahorroActual: meta.ahorroActual,
            montoRestante: meta.montoRestante,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            metas: '',
            montoTotal: 0,
            ahorroActual: 0,
            montoRestante: 0,
        });
    };

    const openAbonoModal = (id: number) => {
        setSelectedMetaId(id);
        setIsAbonoModalOpen(true);
    };

    const getProgreso = (meta: Meta) => {
        return meta.montoTotal > 0 ? (meta.ahorroActual / meta.montoTotal) * 100 : 0;
    };

    const filteredMetas = useMemo(() => {
        if (!Array.isArray(metas)) return [];
        return metas.filter(meta =>
            meta.metas.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [metas, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Metas Financieras</h1>
                            <HelpTooltip content={sectionHelp.metas} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{filteredMetas.length} metas</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nueva Meta
                    </button>
                </div>

                {/* Búsqueda */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar metas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            aria-label="Buscar metas"
                        />
                    </div>
                </div>

                {filteredMetas.length === 0 && !searchTerm && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <EmptyState content={emptyStates.metas} onAction={() => setIsModalOpen(true)} />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMetas.map((meta) => {
                        const progreso = getProgreso(meta);
                        const completada = progreso >= 100;

                        return (
                            <div key={meta.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{meta.metas}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(meta)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400" aria-label="Editar">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(meta.id)} className="text-red-600 hover:text-red-800 dark:text-red-400" aria-label="Eliminar">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className={`font-medium ${completada ? 'text-green-600' : progreso >= 50 ? 'text-blue-600' : 'text-orange-600'}`}>
                                            {progreso.toFixed(1)}%
                                        </span>
                                        <span className={`${completada ? 'text-green-600 font-semibold' : progreso >= 50 ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {completada ? 'Completada! Felicidades!' : progreso >= 75 ? 'Ya casi lo logras!' : progreso >= 50 ? 'Vas por buen camino' : progreso > 0 ? 'Sigue aportando' : 'Haz tu primer abono'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${completada ? 'bg-green-500' : 'bg-purple-600'
                                                }`}
                                            style={{ width: `${Math.min(progreso, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Ahorro actual:</span>
                                        <span className="font-semibold text-green-600">${meta.ahorroActual.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Meta:</span>
                                        <span className="font-semibold dark:text-white">${meta.montoTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Faltante:</span>
                                        <span className="font-semibold text-orange-600">${meta.montoRestante.toFixed(2)}</span>
                                    </div>
                                </div>

                                {!completada && (
                                    <button
                                        onClick={() => openAbonoModal(meta.id)}
                                        className="w-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 flex items-center justify-center gap-2"
                                    >
                                        <DollarSign size={18} />
                                        Abonar
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Modales */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">{editingId ? 'Editar' : 'Nueva'} Meta</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="meta-nombre" className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre de la Meta</label>
                                    <input
                                        id="meta-nombre"
                                        type="text"
                                        value={formData.metas}
                                        onChange={(e) => setFormData({ ...formData, metas: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ej: Vacaciones 2024"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="meta-monto" className="block text-sm font-medium mb-1 dark:text-gray-300">Monto Total (cuanto necesitas ahorrar)</label>
                                    <input
                                        id="meta-monto"
                                        type="number"
                                        step="0.01"
                                        value={formData.montoTotal}
                                        onChange={(e) => setFormData({ ...formData, montoTotal: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="meta-ahorro" className="block text-sm font-medium mb-1 dark:text-gray-300">Ahorro Actual (cuanto llevas ahorrado)</label>
                                    <input
                                        id="meta-ahorro"
                                        type="number"
                                        step="0.01"
                                        value={formData.ahorroActual}
                                        onChange={(e) => setFormData({ ...formData, ahorroActual: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <CuentaSelector
                                    value={formData.cuentaId}
                                    onChange={(id) => setFormData({ ...formData, cuentaId: id })}
                                    label="Cuenta para el Ahorro (Opcional)"
                                    required={false}
                                />

                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
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

                {isAbonoModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">💰 Abonar a Meta</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="meta-abono" className="block text-sm font-medium mb-1 dark:text-gray-300">Monto a abonar</label>
                                    <input
                                        id="meta-abono"
                                        type="number"
                                        step="0.01"
                                        value={montoAbono}
                                        onChange={(e) => setMontoAbono(Number(e.target.value))}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleAbonar} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                                        Abonar
                                    </button>
                                    <button onClick={() => setIsAbonoModalOpen(false)} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
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
