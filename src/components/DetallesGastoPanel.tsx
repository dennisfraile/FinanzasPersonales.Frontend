import { useState } from 'react';
import { X, Plus, Edit2, Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGastoConDetalles, useCreateDetalleGasto, useUpdateDetalleGasto, useDeleteDetalleGasto } from '../hooks/useQueryHooks';
import { useConfirm } from '../context/ConfirmContext';
import type { DetalleGasto } from '../services/detallesGastoService';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface DetallesGastoPanelProps {
    gastoId: number;
    onClose: () => void;
}

export default function DetallesGastoPanel({ gastoId, onClose }: DetallesGastoPanelProps) {
    const { data: gasto, isLoading } = useGastoConDetalles(gastoId);
    const createMutation = useCreateDetalleGasto();
    const updateMutation = useUpdateDetalleGasto();
    const deleteMutation = useDeleteDetalleGasto();
    const confirm = useConfirm();

    const [showForm, setShowForm] = useState(false);
    const [editingDetalle, setEditingDetalle] = useState<DetalleGasto | null>(null);
    const [formData, setFormData] = useState({
        descripcion: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        notas: '',
    });

    const panelModalRef = useFocusTrap<HTMLDivElement>(true, onClose);
    const loadingModalRef = useFocusTrap<HTMLDivElement>(true, onClose);

    const resetForm = () => {
        setFormData({ descripcion: '', monto: 0, fecha: new Date().toISOString().split('T')[0], notas: '' });
        setEditingDetalle(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.monto <= 0) {
            toast.error('El monto debe ser mayor a 0');
            return;
        }

        try {
            if (editingDetalle) {
                await updateMutation.mutateAsync({
                    gastoId,
                    detalleId: editingDetalle.id,
                    data: formData,
                });
                toast.success('Compra actualizada');
            } else {
                await createMutation.mutateAsync({ gastoId, data: formData });
                toast.success('Compra registrada');
            }
            resetForm();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.response?.data || 'Error al guardar';
            toast.error(typeof msg === 'string' ? msg : 'Error al guardar compra');
        }
    };

    const handleEdit = (detalle: DetalleGasto) => {
        setEditingDetalle(detalle);
        setFormData({
            descripcion: detalle.descripcion,
            monto: detalle.monto,
            fecha: detalle.fecha.split('T')[0],
            notas: detalle.notas || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (detalleId: number) => {
        if (!(await confirm('¿Eliminar esta compra?'))) return;
        try {
            await deleteMutation.mutateAsync({ gastoId, detalleId });
            toast.success('Compra eliminada');
        } catch {
            toast.error('Error al eliminar');
        }
    };

    if (isLoading || !gasto) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div ref={loadingModalRef} role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    const porcentaje = gasto.monto > 0 ? (gasto.montoConsumido / gasto.monto) * 100 : 0;
    const barColor = porcentaje >= 90 ? 'bg-red-500' : porcentaje >= 75 ? 'bg-yellow-500' : 'bg-green-500';
    const isMutating = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={panelModalRef} role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <ShoppingCart size={20} className="text-blue-500 shrink-0" />
                                <h2 className="text-xl font-bold dark:text-white truncate">
                                    {gasto.descripcion || 'Sin descripción'}
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {gasto.categoriaNombre} &middot; {gasto.tipo}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ml-2">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">
                                Consumido: <span className="font-semibold">${gasto.montoConsumido.toFixed(2)}</span>
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                                Total: <span className="font-semibold">${gasto.monto.toFixed(2)}</span>
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-300 ${barColor}`}
                                style={{ width: `${Math.min(porcentaje, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className={`text-lg font-bold ${gasto.montoDisponible <= 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                                {gasto.montoDisponible <= 0 ? 'Agotado' : `$${gasto.montoDisponible.toFixed(2)} disponible`}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {porcentaje.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Add/Edit form */}
                <div className="p-6 border-b dark:border-gray-700">
                    {!showForm ? (
                        <button
                            onClick={() => { resetForm(); setShowForm(true); }}
                            disabled={gasto.montoDisponible <= 0}
                            className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Plus size={18} />
                            Registrar compra
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-semibold dark:text-white">
                                    {editingDetalle ? 'Editar compra' : 'Nueva compra'}
                                </h3>
                                {editingDetalle && (
                                    <span className="text-xs text-gray-500">
                                        Disponible: ${(gasto.montoDisponible + editingDetalle.monto).toFixed(2)}
                                    </span>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Descripción (ej: Almuerzo pollo)"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                required
                                autoFocus
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Monto"
                                    value={formData.monto || ''}
                                    onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                    required
                                />
                                <input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                    required
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Notas (opcional)"
                                value={formData.notas}
                                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isMutating}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                                >
                                    {editingDetalle ? 'Actualizar' : 'Agregar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* List of detalles */}
                <div className="p-6">
                    {gasto.detalles.length === 0 ? (
                        <p className="text-center text-gray-400 dark:text-gray-500 py-4 text-sm">
                            No hay compras registradas aún
                        </p>
                    ) : (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                                Compras ({gasto.detalles.length})
                            </h3>
                            {gasto.detalles.map((detalle) => (
                                <div
                                    key={detalle.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium dark:text-white truncate">
                                            {detalle.descripcion}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(detalle.fecha.split('T')[0] + 'T12:00:00').toLocaleDateString()}
                                            {detalle.notas && ` · ${detalle.notas}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-3">
                                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            ${detalle.monto.toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => handleEdit(detalle)}
                                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(detalle.id)}
                                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
