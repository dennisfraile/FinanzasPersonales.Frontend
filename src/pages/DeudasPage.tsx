import { useState, useMemo } from 'react';
import { type Deuda, type CreateDeudaDto, type UpdateDeudaDto, type PagoDeuda, type ProyeccionPago } from '../services/deudasService';
import { deudasService } from '../services/deudasService';
import { Trash2, Plus, Edit2, Search, DollarSign, TrendingDown, Eye, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { Pagination } from '../components/Pagination';
import { CuentaSelector } from '../components/CuentaSelector';
import { useDeudas, useCreateDeuda, useUpdateDeuda, useDeleteDeuda, useRegistrarPagoDeuda, useDeudaPagos } from '../hooks/useQueryHooks';

const ITEMS_PER_PAGE = 9;

const TIPOS_DEUDA = [
    { value: 'TarjetaCredito', label: 'Tarjeta de Crédito' },
    { value: 'PrestamoPersonal', label: 'Préstamo Personal' },
    { value: 'Hipoteca', label: 'Hipoteca' },
    { value: 'PrestamoAuto', label: 'Préstamo Auto' },
    { value: 'Otro', label: 'Otro' },
];

const getTipoLabel = (tipo: string) => TIPOS_DEUDA.find(t => t.value === tipo)?.label || tipo;

const getTipoColor = (tipo: string) => {
    switch (tipo) {
        case 'TarjetaCredito': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'PrestamoPersonal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Hipoteca': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        case 'PrestamoAuto': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
};

export const DeudasPage = () => {
    const { data: deudas = [], isLoading } = useDeudas();
    const createMutation = useCreateDeuda();
    const updateMutation = useUpdateDeuda();
    const deleteMutation = useDeleteDeuda();
    const pagoMutation = useRegistrarPagoDeuda();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedDeudaId, setSelectedDeudaId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [formData, setFormData] = useState<CreateDeudaDto>({
        nombre: '',
        tipo: 'PrestamoPersonal',
        montoOriginal: 0,
        saldoActual: 0,
        tasaInteres: 0,
        pagoMinimo: null,
        diaDePago: null,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaVencimiento: null,
        cuentaId: null,
        notas: null,
    });

    const [pagoData, setPagoData] = useState({
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
    });

    // Resumen cards
    const resumen = useMemo(() => {
        if (!Array.isArray(deudas)) return { totalDeuda: 0, totalPagado: 0, activas: 0, pagadas: 0 };
        return {
            totalDeuda: deudas.filter(d => d.activa).reduce((s, d) => s + d.saldoActual, 0),
            totalPagado: deudas.reduce((s, d) => s + d.totalPagado, 0),
            activas: deudas.filter(d => d.activa).length,
            pagadas: deudas.filter(d => !d.activa).length,
        };
    }, [deudas]);

    const filteredDeudas = useMemo(() => {
        if (!Array.isArray(deudas)) return [];
        return deudas.filter(d => {
            const matchSearch = d.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchTipo = !filterTipo || d.tipo === filterTipo;
            const matchEstado = !filterEstado ||
                (filterEstado === 'activa' && d.activa) ||
                (filterEstado === 'pagada' && !d.activa);
            return matchSearch && matchTipo && matchEstado;
        });
    }, [deudas, searchTerm, filterTipo, filterEstado]);

    const totalPages = Math.ceil(filteredDeudas.length / ITEMS_PER_PAGE);
    const paginatedDeudas = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredDeudas.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredDeudas, currentPage]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                const updateData: UpdateDeudaDto = {
                    id: editingId,
                    nombre: formData.nombre,
                    tipo: formData.tipo,
                    tasaInteres: formData.tasaInteres,
                    pagoMinimo: formData.pagoMinimo,
                    diaDePago: formData.diaDePago,
                    fechaVencimiento: formData.fechaVencimiento,
                    cuentaId: formData.cuentaId,
                    activa: true,
                    notas: formData.notas,
                };
                await updateMutation.mutateAsync({ id: editingId, data: updateData });
                toast.success('Deuda actualizada');
            } else {
                await createMutation.mutateAsync(formData);
                toast.success('Deuda registrada');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al guardar deuda');
        }
    };

    const handlePago = async () => {
        if (!selectedDeudaId || pagoData.monto <= 0) return;
        try {
            await pagoMutation.mutateAsync({
                deudaId: selectedDeudaId,
                data: {
                    monto: pagoData.monto,
                    fecha: pagoData.fecha,
                    descripcion: pagoData.descripcion || null,
                },
            });
            toast.success(`Pago de $${pagoData.monto.toFixed(2)} registrado`);
            setIsPagoModalOpen(false);
            setPagoData({ monto: 0, fecha: new Date().toISOString().split('T')[0], descripcion: '' });
            setSelectedDeudaId(null);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al registrar pago');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar esta deuda y todos sus pagos?')) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('Deuda eliminada');
            } catch (error) {
                console.error('Error:', error);
                toast.error('Error al eliminar deuda');
            }
        }
    };

    const handleEdit = (deuda: Deuda) => {
        setEditingId(deuda.id);
        setFormData({
            nombre: deuda.nombre,
            tipo: deuda.tipo,
            montoOriginal: deuda.montoOriginal,
            saldoActual: deuda.saldoActual,
            tasaInteres: deuda.tasaInteres,
            pagoMinimo: deuda.pagoMinimo,
            diaDePago: deuda.diaDePago,
            fechaInicio: deuda.fechaInicio.split('T')[0],
            fechaVencimiento: deuda.fechaVencimiento?.split('T')[0] || null,
            cuentaId: deuda.cuentaId,
            notas: deuda.notas,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            nombre: '',
            tipo: 'PrestamoPersonal',
            montoOriginal: 0,
            saldoActual: 0,
            tasaInteres: 0,
            pagoMinimo: null,
            diaDePago: null,
            fechaInicio: new Date().toISOString().split('T')[0],
            fechaVencimiento: null,
            cuentaId: null,
            notas: null,
        });
    };

    const openPagoModal = (deuda: Deuda) => {
        setSelectedDeudaId(deuda.id);
        setPagoData({
            monto: deuda.pagoMinimo || 0,
            fecha: new Date().toISOString().split('T')[0],
            descripcion: '',
        });
        setIsPagoModalOpen(true);
    };

    const openDetail = (deudaId: number) => {
        setSelectedDeudaId(deudaId);
        setIsDetailOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Deudas</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{filteredDeudas.length} deudas registradas</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nueva Deuda
                    </button>
                </div>

                {/* Resumen Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deuda Total</p>
                        <p className="text-xl font-bold text-red-600 mt-1">${resumen.totalDeuda.toFixed(2)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Pagado</p>
                        <p className="text-xl font-bold text-green-600 mt-1">${resumen.totalPagado.toFixed(2)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Activas</p>
                        <p className="text-xl font-bold text-orange-600 mt-1">{resumen.activas}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pagadas</p>
                        <p className="text-xl font-bold text-green-600 mt-1">{resumen.pagadas}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar deudas..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <select
                            value={filterTipo}
                            onChange={(e) => { setFilterTipo(e.target.value); setCurrentPage(1); }}
                            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Todos los tipos</option>
                            {TIPOS_DEUDA.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <select
                            value={filterEstado}
                            onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(1); }}
                            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Todos los estados</option>
                            <option value="activa">Activas</option>
                            <option value="pagada">Pagadas</option>
                        </select>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredDeudas.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                        <TrendingDown size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            {searchTerm || filterTipo || filterEstado ? 'Sin resultados' : 'No tienes deudas registradas'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {searchTerm || filterTipo || filterEstado
                                ? 'Intenta cambiar los filtros de búsqueda'
                                : 'Registra tus deudas para hacer seguimiento de pagos y proyecciones'}
                        </p>
                        {!searchTerm && !filterTipo && !filterEstado && (
                            <button onClick={() => setIsModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                                <Plus size={18} className="inline mr-1" /> Registrar primera deuda
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedDeudas.map((deuda) => (
                                <DeudaCard
                                    key={deuda.id}
                                    deuda={deuda}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onPago={openPagoModal}
                                    onDetail={openDetail}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        )}
                    </>
                )}

                {/* Modal Crear/Editar */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">{editingId ? 'Editar' : 'Nueva'} Deuda</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ej: Tarjeta Visa, Préstamo Auto"
                                        required
                                        maxLength={200}
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
                                        {TIPOS_DEUDA.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto Original</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={formData.montoOriginal || ''}
                                            onChange={(e) => setFormData({ ...formData, montoOriginal: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                            disabled={!!editingId}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Saldo Actual</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.saldoActual || ''}
                                            onChange={(e) => setFormData({ ...formData, saldoActual: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                            disabled={!!editingId}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tasa de Interés (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={formData.tasaInteres || ''}
                                            onChange={(e) => setFormData({ ...formData, tasaInteres: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Pago Mínimo</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={formData.pagoMinimo || ''}
                                            onChange={(e) => setFormData({ ...formData, pagoMinimo: e.target.value ? Number(e.target.value) : null })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Opcional"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Día de Pago</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={formData.diaDePago || ''}
                                            onChange={(e) => setFormData({ ...formData, diaDePago: e.target.value ? Number(e.target.value) : null })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="1-31"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha Inicio</label>
                                        <input
                                            type="date"
                                            value={formData.fechaInicio}
                                            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha Vencimiento (Opcional)</label>
                                    <input
                                        type="date"
                                        value={formData.fechaVencimiento || ''}
                                        onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value || null })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <CuentaSelector
                                    value={formData.cuentaId}
                                    onChange={(id) => setFormData({ ...formData, cuentaId: id })}
                                    label="Cuenta Vinculada (Opcional)"
                                    required={false}
                                />
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Notas (Opcional)</label>
                                    <textarea
                                        value={formData.notas || ''}
                                        onChange={(e) => setFormData({ ...formData, notas: e.target.value || null })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        rows={2}
                                        maxLength={500}
                                        placeholder="Notas adicionales..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
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

                {/* Modal Registrar Pago */}
                {isPagoModalOpen && selectedDeudaId && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">Registrar Pago</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto del Pago</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={pagoData.monto || ''}
                                        onChange={(e) => setPagoData({ ...pagoData, monto: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label>
                                    <input
                                        type="date"
                                        value={pagoData.fecha}
                                        onChange={(e) => setPagoData({ ...pagoData, fecha: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción (Opcional)</label>
                                    <input
                                        type="text"
                                        value={pagoData.descripcion}
                                        onChange={(e) => setPagoData({ ...pagoData, descripcion: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ej: Pago mensual marzo"
                                        maxLength={200}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handlePago} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                                        Registrar Pago
                                    </button>
                                    <button onClick={() => setIsPagoModalOpen(false)} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Detalle */}
                {isDetailOpen && selectedDeudaId && (
                    <DeudaDetailModal
                        deudaId={selectedDeudaId}
                        deuda={deudas.find(d => d.id === selectedDeudaId)!}
                        onClose={() => { setIsDetailOpen(false); setSelectedDeudaId(null); }}
                    />
                )}
            </div>
        </div>
    );
};

// ============ DeudaCard Component ============
interface DeudaCardProps {
    deuda: Deuda;
    onEdit: (deuda: Deuda) => void;
    onDelete: (id: number) => void;
    onPago: (deuda: Deuda) => void;
    onDetail: (id: number) => void;
}

const DeudaCard = ({ deuda, onEdit, onDelete, onPago, onDetail }: DeudaCardProps) => {
    const progreso = deuda.porcentajePagado;
    const pagada = !deuda.activa;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border ${pagada ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">{deuda.nombre}</h3>
                    <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${getTipoColor(deuda.tipo)}`}>
                        {getTipoLabel(deuda.tipo)}
                    </span>
                </div>
                <div className="flex gap-1 ml-2">
                    <button onClick={() => onDetail(deuda.id)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-1" title="Ver detalle">
                        <Eye size={16} />
                    </button>
                    <button onClick={() => onEdit(deuda)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-1" title="Editar">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(deuda.id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1" title="Eliminar">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${pagada ? 'text-green-600' : progreso >= 50 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {progreso.toFixed(1)}% pagado
                    </span>
                    {pagada && <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 size={14} /> Pagada</span>}
                    {!pagada && deuda.diaDePago && (
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-xs">
                            <Clock size={12} /> Día {deuda.diaDePago}
                        </span>
                    )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                        className={`h-2.5 rounded-full transition-all ${pagada ? 'bg-green-500' : progreso >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                        style={{ width: `${Math.min(progreso, 100)}%` }}
                    />
                </div>
            </div>

            {/* Info */}
            <div className="space-y-1.5 mb-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monto original:</span>
                    <span className="font-semibold dark:text-white">${deuda.montoOriginal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Saldo actual:</span>
                    <span className="font-semibold text-red-600">${deuda.saldoActual.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total pagado:</span>
                    <span className="font-semibold text-green-600">${deuda.totalPagado.toFixed(2)}</span>
                </div>
                {deuda.tasaInteres > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tasa interés:</span>
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">{deuda.tasaInteres}%</span>
                    </div>
                )}
            </div>

            {/* Action button */}
            {deuda.activa && (
                <button
                    onClick={() => onPago(deuda)}
                    className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <DollarSign size={16} />
                    Registrar Pago
                </button>
            )}
        </div>
    );
};

// ============ Detail Modal Component ============
interface DeudaDetailModalProps {
    deudaId: number;
    deuda: Deuda;
    onClose: () => void;
}

const DeudaDetailModal = ({ deudaId, deuda, onClose }: DeudaDetailModalProps) => {
    const { data: pagos = [], isLoading: loadingPagos } = useDeudaPagos(deudaId);
    const [showProyeccion, setShowProyeccion] = useState(false);
    const [pagoMensualCustom, setPagoMensualCustom] = useState<number>(deuda.pagoMinimo || 0);
    const [proyeccion, setProyeccion] = useState<ProyeccionPago[]>([]);
    const [loadingProyeccion, setLoadingProyeccion] = useState(false);

    const handleLoadProyeccion = async () => {
        if (pagoMensualCustom <= 0) {
            toast.error('Ingresa un monto de pago mensual');
            return;
        }
        setLoadingProyeccion(true);
        try {
            const data = await deudasService.getProyeccion(deudaId, pagoMensualCustom);
            setProyeccion(data);
            setShowProyeccion(true);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al calcular proyección');
        } finally {
            setLoadingProyeccion(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">{deuda.nombre}</h2>
                        <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${getTipoColor(deuda.tipo)}`}>
                            {getTipoLabel(deuda.tipo)}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold">
                        &times;
                    </button>
                </div>

                {/* Resumen de la deuda */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Original</p>
                        <p className="font-bold dark:text-white">${deuda.montoOriginal.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Saldo</p>
                        <p className="font-bold text-red-600">${deuda.saldoActual.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pagado</p>
                        <p className="font-bold text-green-600">${deuda.totalPagado.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Progreso</p>
                        <p className="font-bold text-blue-600">{deuda.porcentajePagado.toFixed(1)}%</p>
                    </div>
                </div>

                {/* Historial de pagos */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold dark:text-white mb-3">Historial de Pagos</h3>
                    {loadingPagos ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando...</p>
                    ) : pagos.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No hay pagos registrados aún.</p>
                    ) : (
                        <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Fecha</th>
                                        <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">Monto</th>
                                        <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">Capital</th>
                                        <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">Interés</th>
                                        <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Descripción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {pagos.map((pago: PagoDeuda) => (
                                        <tr key={pago.id}>
                                            <td className="py-2 px-2 dark:text-gray-300">{new Date(pago.fecha).toLocaleDateString()}</td>
                                            <td className="py-2 px-2 text-right font-medium dark:text-white">${pago.monto.toFixed(2)}</td>
                                            <td className="py-2 px-2 text-right text-green-600">${(pago.montoCapital || 0).toFixed(2)}</td>
                                            <td className="py-2 px-2 text-right text-orange-600">${(pago.montoInteres || 0).toFixed(2)}</td>
                                            <td className="py-2 px-2 text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{pago.descripcion || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Proyección */}
                {deuda.activa && (
                    <div>
                        <h3 className="text-lg font-semibold dark:text-white mb-3">Proyección de Pagos</h3>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={pagoMensualCustom || ''}
                                onChange={(e) => setPagoMensualCustom(Number(e.target.value))}
                                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                placeholder="Pago mensual..."
                            />
                            <button
                                onClick={handleLoadProyeccion}
                                disabled={loadingProyeccion}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                            >
                                {loadingProyeccion ? 'Calculando...' : 'Calcular'}
                            </button>
                        </div>

                        {showProyeccion && proyeccion.length > 0 && (
                            <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Mes</th>
                                            <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">Pago</th>
                                            <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">Capital</th>
                                            <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">Interés</th>
                                            <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {proyeccion.map((p: ProyeccionPago) => (
                                            <tr key={p.mes}>
                                                <td className="py-2 px-2 dark:text-gray-300">#{p.mes}</td>
                                                <td className="py-2 px-2 text-right font-medium dark:text-white">${p.pagoMensual.toFixed(2)}</td>
                                                <td className="py-2 px-2 text-right text-green-600">${p.capitalDelMes.toFixed(2)}</td>
                                                <td className="py-2 px-2 text-right text-orange-600">${p.interesDelMes.toFixed(2)}</td>
                                                <td className="py-2 px-2 text-right font-medium dark:text-white">${p.saldoRestante.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                                    <p className="text-blue-800 dark:text-blue-300">
                                        Con pagos de <strong>${pagoMensualCustom.toFixed(2)}/mes</strong>, liquidarás esta deuda en <strong>{proyeccion.length} meses</strong> ({(proyeccion.length / 12).toFixed(1)} años).
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6">
                    <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
