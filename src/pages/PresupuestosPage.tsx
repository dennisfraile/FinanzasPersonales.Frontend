import { useState, useMemo } from 'react';
import { type Presupuesto, type CreatePresupuestoDto } from '../services/presupuestosService';
import { type Categoria } from '../services/categoriasService';
import { Trash2, Plus, Edit2, AlertTriangle, CheckCircle2, Search, BarChart3 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { usePresupuestos, useCreatePresupuesto, useUpdatePresupuesto, useDeletePresupuesto, useCategorias } from '../hooks/useQueryHooks';
import HelpTooltip from '../components/HelpTooltip';
import EmptyState from '../components/EmptyState';
import { sectionHelp, emptyStates } from '../utils/helpContent';

// Helper para obtener número de semana ISO
const getISOWeek = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const PresupuestosPage = () => {
    const navigate = useNavigate();
    const { data: presupuestos = [] } = usePresupuestos();
    const { data: allCategorias = [] } = useCategorias();
    const categorias = useMemo(() => allCategorias.filter((c: Categoria) => c.tipo === 'Gasto'), [allCategorias]);

    const createPresupuestoMutation = useCreatePresupuesto();
    const updatePresupuestoMutation = useUpdatePresupuesto();
    const deletePresupuestoMutation = useDeletePresupuesto();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<CreatePresupuestoDto>({
        categoriaId: 0,
        montoLimite: 0,
        periodo: 'Semanal',
        mesAplicable: new Date().getMonth() + 1,
        anoAplicable: new Date().getFullYear(),
        semanaAplicable: getISOWeek(new Date()),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updatePresupuestoMutation.mutateAsync({ id: editingId, data: formData });
                toast.success('Presupuesto actualizado');
            } else {
                await createPresupuestoMutation.mutateAsync(formData);
                toast.success('Presupuesto creado');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving presupuesto:', error);
            toast.error('Error al guardar presupuesto');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
            try {
                await deletePresupuestoMutation.mutateAsync(id);
                toast.success('Presupuesto eliminado');
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
            semanaAplicable: presupuesto.semanaAplicable,
            permiteRollover: presupuesto.permiteRollover,
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

    const alertSummary = useMemo(() => {
        if (!Array.isArray(presupuestos)) return { danger: [], warning: [] };
        return {
            danger: presupuestos.filter(p => p.porcentajeUtilizado >= 100),
            warning: presupuestos.filter(p => p.porcentajeUtilizado >= 80 && p.porcentajeUtilizado < 100),
        };
    }, [presupuestos]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Presupuestos</h1>
                            <HelpTooltip content={sectionHelp.presupuestos} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {new Date().toLocaleString('es', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/presupuestos/dashboard')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <BarChart3 size={20} />
                            <span className="hidden sm:inline">Dashboard</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">Nuevo presupuesto</span>
                        </button>
                    </div>
                </div>

                {/* Banner de alertas */}
                {(alertSummary.danger.length > 0 || alertSummary.warning.length > 0) && (
                    <div className="mb-6 space-y-2">
                        {alertSummary.danger.length > 0 && (
                            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3">
                                <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-red-700 dark:text-red-300">
                                    <span className="font-semibold">Límite excedido: </span>
                                    {alertSummary.danger.map(p => p.categoriaNombre).join(', ')}
                                </div>
                            </div>
                        )}
                        {alertSummary.warning.length > 0 && (
                            <div className="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-xl px-4 py-3">
                                <AlertTriangle size={18} className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-orange-700 dark:text-orange-300">
                                    <span className="font-semibold">Cerca del límite: </span>
                                    {alertSummary.warning.map(p => `${p.categoriaNombre} (${p.porcentajeUtilizado.toFixed(0)}%)`).join(', ')}
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                            aria-label="Buscar presupuestos"
                        />
                    </div>
                </div>

                {filteredPresupuestos.length === 0 && !searchTerm ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <EmptyState content={emptyStates.presupuestos} onAction={() => setIsModalOpen(true)} />
                    </div>
                ) : null}

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
                                                <span>Excediste el limite. Revisa tus gastos en esta categoria.</span>
                                            </div>
                                        )}
                                        {alertLevel === 'warning' && (
                                            <div className="flex items-center gap-1 text-orange-600 text-sm mt-1">
                                                <AlertTriangle size={16} />
                                                <span>Cuidado, te acercas al limite ({presupuesto.porcentajeUtilizado.toFixed(0)}%)</span>
                                            </div>
                                        )}
                                        {alertLevel === 'normal' && (
                                            <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                                                <CheckCircle2 size={16} />
                                                <span>Vas bien, tienes margen</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => handleEdit(presupuesto)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400" aria-label="Editar">
                                            <Edit2 size={18} />
                                        </button>
                                        <button type="button" onClick={() => handleDelete(presupuesto.id)} className="text-red-600 hover:text-red-800 dark:text-red-400" aria-label="Eliminar">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Barra de progreso */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <span>{presupuesto.porcentajeUtilizado.toFixed(1)}% usado</span>
                                        <span className="font-semibold dark:text-white">
                                            ${presupuesto.gastadoActual.toFixed(2)} / ${presupuesto.limiteEfectivo?.toFixed(2) || presupuesto.montoLimite.toFixed(2)}
                                        </span>
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
                                    {presupuesto.permiteRollover && presupuesto.rollover > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Acumulado anterior:</span>
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">+${presupuesto.rollover.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {presupuesto.permiteRollover && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Rollover:</span>
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-medium">Activo</span>
                                        </div>
                                    )}
                                </div>

                                {/* Transferencias */}
                                {presupuesto.transferencias && presupuesto.transferencias.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Transferencias</p>
                                        <div className="space-y-1">
                                            {presupuesto.transferencias.map((t) => (
                                                <div key={t.id} className="flex items-center gap-1.5 text-xs">
                                                    {t.direccion === 'salida' ? (
                                                        <>
                                                            <span className="text-red-500">-${t.monto.toFixed(2)}</span>
                                                            <span className="text-gray-400 dark:text-gray-500">hacia</span>
                                                            <span className="font-medium dark:text-gray-300">{t.categoriaDestinoNombre}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-green-500">+${t.monto.toFixed(2)}</span>
                                                            <span className="text-gray-400 dark:text-gray-500">desde</span>
                                                            <span className="font-medium dark:text-gray-300">{t.categoriaOrigenNombre}</span>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Modal crear/editar */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">{editingId ? 'Editar' : 'Nuevo'} presupuesto</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="presupuesto-categoria" className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría</label>
                                    <select
                                        id="presupuesto-categoria"
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
                                    <label htmlFor="presupuesto-limite" className="block text-sm font-medium mb-1 dark:text-gray-300">Limite de Gasto (maximo que quieres gastar)</label>
                                    <input
                                        id="presupuesto-limite"
                                        type="number"
                                        step="0.01"
                                        value={formData.montoLimite}
                                        onChange={(e) => setFormData({ ...formData, montoLimite: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="presupuesto-periodo" className="block text-sm font-medium mb-1 dark:text-gray-300">Período</label>
                                    <select
                                        id="presupuesto-periodo"
                                        value={formData.periodo}
                                        onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    >
                                        <option value="Semanal">Semanal</option>
                                        <option value="Quincenal">Quincenal</option>
                                        <option value="Mensual">Mensual</option>
                                        <option value="Trimestral">Trimestral</option>
                                        <option value="Semestral">Semestral</option>
                                        <option value="Anual">Anual</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <label htmlFor="presupuesto-rollover" className="text-sm font-medium dark:text-gray-300">Acumular sobrante</label>
                                        <p className="text-xs text-gray-400 mt-0.5">El dinero no gastado se suma al siguiente periodo</p>
                                    </div>
                                    <button
                                        type="button"
                                        id="presupuesto-rollover"
                                        onClick={() => setFormData({ ...formData, permiteRollover: !formData.permiteRollover })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.permiteRollover ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.permiteRollover ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                {formData.periodo === 'Semanal' && (
                                    <div>
                                        <label htmlFor="presupuesto-semana" className="block text-sm font-medium mb-1 dark:text-gray-300">Semana del año</label>
                                        <input
                                            id="presupuesto-semana"
                                            type="number"
                                            min="1"
                                            max="53"
                                            value={formData.semanaAplicable ?? getISOWeek(new Date())}
                                            onChange={(e) => setFormData({ ...formData, semanaAplicable: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Semana actual: {getISOWeek(new Date())}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="presupuesto-mes" className="block text-sm font-medium mb-1 dark:text-gray-300">Mes</label>
                                        <input
                                            id="presupuesto-mes"
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
                                        <label htmlFor="presupuesto-ano" className="block text-sm font-medium mb-1 dark:text-gray-300">Año</label>
                                        <input
                                            id="presupuesto-ano"
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
