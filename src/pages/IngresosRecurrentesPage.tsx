import { useState } from 'react';
import { toast } from 'react-toastify';
import type { IngresoRecurrente, CreateIngresoRecurrenteDto } from '../services/ingresosRecurrentesService';
import { useCuentas } from '../hooks/useCuentas';
import { Repeat, Plus, Edit2, Trash2, Play } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import HelpTooltip from '../components/HelpTooltip';
import { sectionHelp } from '../utils/helpContent';
import {
    useIngresosRecurrentes, useCreateIngresoRecurrente, useUpdateIngresoRecurrente,
    useDeleteIngresoRecurrente, useGenerarIngresoRecurrente, useGenerarPendientesIngresos,
    useCategorias
} from '../hooks/useQueryHooks';

export const IngresosRecurrentesPage = () => {
    const { theme } = useTheme();
    const { data: recurrentes = [], isLoading } = useIngresosRecurrentes();
    const { data: categories = [] } = useCategorias();
    const { cuentas } = useCuentas();

    const createMutation = useCreateIngresoRecurrente();
    const updateMutation = useUpdateIngresoRecurrente();
    const deleteMutation = useDeleteIngresoRecurrente();
    const generarMutation = useGenerarIngresoRecurrente();
    const generarPendientesMutation = useGenerarPendientesIngresos();

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState<CreateIngresoRecurrenteDto & { activo: boolean }>({
        descripcion: '',
        categoriaId: 0,
        monto: 0,
        cuentaId: null,
        frecuencia: 'Quincenal',
        diaDePago: 15,
        activo: true
    });

    const getDescripcionFrecuencia = (frecuencia: string, diaDePago: number) => {
        if (frecuencia === 'Quincenal') {
            const segundoDia = diaDePago <= 15 ? 'fin de mes' : `${diaDePago - 15}`;
            return `Cada ${diaDePago} y ${segundoDia}`;
        }
        if (frecuencia === 'Semanal') return `Cada semana`;
        if (frecuencia === 'Mensual') return `Cada dia ${diaDePago}`;
        if (frecuencia === 'Anual') return `Cada dia ${diaDePago} anual`;
        return frecuencia;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, data: formData });
                toast.success('Ingreso recurrente actualizado');
            } else {
                await createMutation.mutateAsync(formData);
                toast.success('Ingreso recurrente creado');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al guardar');
        }
    };

    const handleEdit = (rec: IngresoRecurrente) => {
        setEditingId(rec.id);
        setFormData({
            descripcion: rec.descripcion,
            categoriaId: rec.categoriaId,
            monto: rec.monto,
            cuentaId: rec.cuentaId,
            frecuencia: rec.frecuencia,
            diaDePago: rec.diaDePago,
            activo: rec.activo
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Eliminar este ingreso recurrente?')) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Ingreso recurrente eliminado');
        } catch {
            toast.error('Error al eliminar');
        }
    };

    const handleGenerar = async (id: number) => {
        try {
            await generarMutation.mutateAsync(id);
            toast.success('Ingreso generado!');
        } catch {
            toast.error('Error al generar ingreso');
        }
    };

    const handleGenerarPendientes = async () => {
        try {
            const result = await generarPendientesMutation.mutateAsync();
            toast.success(result.mensaje);
        } catch {
            toast.error('Error al generar pendientes');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            descripcion: '',
            categoriaId: 0,
            monto: 0,
            cuentaId: null,
            frecuencia: 'Quincenal',
            diaDePago: 15,
            activo: true
        });
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
    }

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-6`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                            Ingresos Recurrentes <HelpTooltip content={sectionHelp.ingresosRecurrentes} />
                        </h1>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Gestiona tus ingresos automaticos (salario, rentas, etc.)
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleGenerarPendientes}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            <Play size={20} />
                            Generar Pendientes
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            <Plus size={20} />
                            Nuevo
                        </button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {recurrentes.length === 0 ? (
                        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center`}>
                            <Repeat size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                No hay ingresos recurrentes. Crea uno para automatizar tus ingresos.
                            </p>
                        </div>
                    ) : (
                        recurrentes.map((rec) => (
                            <div
                                key={rec.id}
                                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 ${!rec.activo ? 'opacity-60' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Repeat className={rec.activo ? 'text-emerald-500' : 'text-gray-400'} size={24} />
                                            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                {rec.descripcion}
                                            </h3>
                                            {!rec.activo && (
                                                <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">
                                                    Inactivo
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                                            <div>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Monto
                                                </p>
                                                <p className="text-lg font-semibold text-emerald-500">
                                                    ${rec.monto.toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Frecuencia
                                                </p>
                                                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {getDescripcionFrecuencia(rec.frecuencia, rec.diaDePago)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Proxima Fecha
                                                </p>
                                                <p className="text-lg font-semibold text-orange-500">
                                                    {new Date(rec.proximaFecha).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Categoria
                                                </p>
                                                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {rec.categoriaNombre || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Cuenta
                                                </p>
                                                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {rec.cuentaNombre || 'Sin cuenta'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {rec.activo && (
                                            <button
                                                onClick={() => handleGenerar(rec.id)}
                                                className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                                                title="Generar ahora"
                                            >
                                                <Play size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(rec)}
                                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            aria-label="Editar"
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rec.id)}
                                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                                            aria-label="Eliminar"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
                            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {editingId ? 'Editar' : 'Nuevo'} Ingreso Recurrente
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="ir-descripcion" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Descripcion
                                    </label>
                                    <input
                                        id="ir-descripcion"
                                        type="text"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        placeholder="Ej: Salario quincenal"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ir-categoria" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Categoria
                                    </label>
                                    <select
                                        id="ir-categoria"
                                        value={formData.categoriaId}
                                        onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
                                        className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        required
                                    >
                                        <option value={0}>Seleccionar...</option>
                                        {categories.filter(c => c.tipo === 'Ingreso').map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="ir-monto" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Monto
                                    </label>
                                    <input
                                        id="ir-monto"
                                        type="number"
                                        step="0.01"
                                        value={formData.monto}
                                        onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) })}
                                        className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ir-cuenta" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Cuenta (Opcional)
                                    </label>
                                    <select
                                        id="ir-cuenta"
                                        value={formData.cuentaId || ''}
                                        onChange={(e) => setFormData({ ...formData, cuentaId: e.target.value ? Number(e.target.value) : null })}
                                        className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    >
                                        <option value="">Sin cuenta</option>
                                        {cuentas.map(cta => (
                                            <option key={cta.id} value={cta.id}>{cta.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="ir-frecuencia" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Frecuencia
                                        </label>
                                        <select
                                            id="ir-frecuencia"
                                            value={formData.frecuencia}
                                            onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        >
                                            <option value="Semanal">Semanal</option>
                                            <option value="Quincenal">Quincenal</option>
                                            <option value="Mensual">Mensual</option>
                                            <option value="Anual">Anual</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="ir-dia" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {formData.frecuencia === 'Quincenal' ? 'Primer dia de pago' : 'Dia de pago'}
                                        </label>
                                        <input
                                            id="ir-dia"
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={formData.diaDePago}
                                            onChange={(e) => setFormData({ ...formData, diaDePago: Number(e.target.value) })}
                                            className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                            required
                                        />
                                    </div>
                                </div>
                                {formData.frecuencia === 'Quincenal' && (
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Se generara el dia {formData.diaDePago} y el {formData.diaDePago <= 15 ? 'ultimo dia del mes' : `dia ${formData.diaDePago - 15}`}
                                    </p>
                                )}
                                {editingId && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="ir-activo"
                                            type="checkbox"
                                            checked={formData.activo}
                                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="ir-activo" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                            Activo
                                        </label>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700">
                                        Guardar
                                    </button>
                                    <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
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
