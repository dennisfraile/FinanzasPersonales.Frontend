import { useState } from 'react';
import { toast } from 'react-toastify';
import type { GastoProgramado, CreateGastoProgramadoDto, PagarGastoProgramadoDto } from '../services/gastosProgramadosService';
import { useCuentas } from '../hooks/useCuentas';
import { CalendarClock, Plus, Edit2, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Filter, CreditCard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import HelpTooltip from '../components/HelpTooltip';
import { sectionHelp } from '../utils/helpContent';
import {
    useGastosProgramados, useCreateGastoProgramado, useUpdateGastoProgramado,
    useDeleteGastoProgramado, usePagarGastoProgramado, useCancelarGastoProgramado,
    useCategorias
} from '../hooks/useQueryHooks';

const estadoConfig: Record<string, { color: string; darkColor: string; icon: React.ElementType; label: string }> = {
    Pendiente: { color: 'bg-yellow-100 text-yellow-800', darkColor: 'bg-yellow-900/30 text-yellow-400', icon: Clock, label: 'Pendiente' },
    Pagado: { color: 'bg-green-100 text-green-800', darkColor: 'bg-green-900/30 text-green-400', icon: CheckCircle, label: 'Pagado' },
    Vencido: { color: 'bg-red-100 text-red-800', darkColor: 'bg-red-900/30 text-red-400', icon: AlertTriangle, label: 'Vencido' },
    Cancelado: { color: 'bg-gray-100 text-gray-800', darkColor: 'bg-gray-700 text-gray-400', icon: XCircle, label: 'Cancelado' },
};

export const GastosProgramadosPage = () => {
    const { theme } = useTheme();
    const [filtroEstado, setFiltroEstado] = useState<string | undefined>(undefined);
    const { data: programados = [], isLoading } = useGastosProgramados(filtroEstado);
    const { data: categories = [] } = useCategorias();
    const { cuentas } = useCuentas();

    const createMutation = useCreateGastoProgramado();
    const updateMutation = useUpdateGastoProgramado();
    const deleteMutation = useDeleteGastoProgramado();
    const pagarMutation = usePagarGastoProgramado();
    const cancelarMutation = useCancelarGastoProgramado();

    const [showModal, setShowModal] = useState(false);
    const [showPagarModal, setShowPagarModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [pagandoGasto, setPagandoGasto] = useState<GastoProgramado | null>(null);

    const [formData, setFormData] = useState<CreateGastoProgramadoDto>({
        descripcion: '',
        categoriaId: 0,
        cuentaId: null,
        monto: 0,
        esMontoVariable: false,
        fechaVencimiento: '',
        notas: null,
    });

    const [pagarData, setPagarData] = useState<PagarGastoProgramadoDto>({
        montoPagado: null,
        cuentaId: null,
        fechaPago: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, data: formData });
                toast.success('Gasto programado actualizado');
            } else {
                await createMutation.mutateAsync(formData);
                toast.success('Gasto programado creado');
            }
            handleCloseModal();
        } catch {
            toast.error('Error al guardar');
        }
    };

    const handleEdit = (gp: GastoProgramado) => {
        setEditingId(gp.id);
        setFormData({
            descripcion: gp.descripcion,
            categoriaId: gp.categoriaId,
            cuentaId: gp.cuentaId,
            monto: gp.monto,
            esMontoVariable: gp.esMontoVariable,
            fechaVencimiento: gp.fechaVencimiento.split('T')[0],
            notas: gp.notas,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este gasto programado?')) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Gasto programado eliminado');
        } catch {
            toast.error('Error al eliminar');
        }
    };

    const handleOpenPagar = (gp: GastoProgramado) => {
        setPagandoGasto(gp);
        setPagarData({
            montoPagado: gp.esMontoVariable ? null : gp.monto,
            cuentaId: gp.cuentaId,
            fechaPago: null,
        });
        setShowPagarModal(true);
    };

    const handlePagar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pagandoGasto) return;
        try {
            await pagarMutation.mutateAsync({ id: pagandoGasto.id, data: pagarData });
            toast.success('Pago registrado exitosamente');
            setShowPagarModal(false);
            setPagandoGasto(null);
        } catch {
            toast.error('Error al registrar el pago');
        }
    };

    const handleCancelar = async (id: number) => {
        if (!confirm('¿Cancelar este gasto programado?')) return;
        try {
            await cancelarMutation.mutateAsync(id);
            toast.success('Gasto cancelado');
        } catch {
            toast.error('Error al cancelar');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            descripcion: '',
            categoriaId: 0,
            cuentaId: null,
            monto: 0,
            esMontoVariable: false,
            fechaVencimiento: '',
            notas: null,
        });
    };

    const getDiasLabel = (dias: number) => {
        if (dias < 0) return `Vencido hace ${Math.abs(dias)} dia(s)`;
        if (dias === 0) return 'Vence hoy';
        if (dias === 1) return 'Vence manana';
        return `Vence en ${dias} dias`;
    };

    const getDiasColor = (dias: number, estado: string) => {
        if (estado === 'Pagado' || estado === 'Cancelado') return theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
        if (dias < 0) return 'text-red-500';
        if (dias <= 3) return 'text-orange-500';
        if (dias <= 7) return 'text-yellow-500';
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
    }

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-6`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Gastos programados
                            </h1>
                            <HelpTooltip content={sectionHelp.gastosProgramados} />
                        </div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Recibos, cobros y pagos con fecha limite
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Nuevo</span>
                    </button>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setFiltroEstado(undefined)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            !filtroEstado
                                ? 'bg-blue-600 text-white'
                                : theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <Filter size={14} />
                        Todos
                    </button>
                    {Object.entries(estadoConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => setFiltroEstado(key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    filtroEstado === key
                                        ? 'bg-blue-600 text-white'
                                        : theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <Icon size={14} />
                                {config.label}
                            </button>
                        );
                    })}
                </div>

                {/* Lista */}
                <div className="grid gap-4">
                    {programados.length === 0 ? (
                        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center`}>
                            <CalendarClock size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {filtroEstado ? `No hay gastos con estado "${filtroEstado}"` : 'No hay gastos programados. Crea uno nuevo.'}
                            </p>
                        </div>
                    ) : (
                        programados.map((gp) => {
                            const estado = estadoConfig[gp.estado] || estadoConfig.Pendiente;
                            const EstadoIcon = estado.icon;
                            const isFinalized = gp.estado === 'Pagado' || gp.estado === 'Cancelado';

                            return (
                                <div
                                    key={gp.id}
                                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 sm:p-6 ${isFinalized ? 'opacity-70' : ''}`}
                                >
                                    {/* Mobile: stacked layout */}
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Title + badge */}
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <CalendarClock className={gp.estado === 'Pendiente' ? 'text-blue-500' : 'text-gray-400'} size={20} />
                                                <h3 className={`text-lg font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {gp.descripcion}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? estado.darkColor : estado.color}`}>
                                                    <EstadoIcon size={12} />
                                                    {estado.label}
                                                </span>
                                                {gp.esMontoVariable && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'}`}>
                                                        Variable
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
                                                <div>
                                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        {gp.estado === 'Pagado' ? 'Pagado' : 'Monto'}
                                                    </p>
                                                    <p className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                        ${(gp.montoPagado ?? gp.monto).toFixed(2)}
                                                    </p>
                                                    {gp.montoPagado && gp.montoPagado !== gp.monto && (
                                                        <p className={`text-xs line-through ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                            ${gp.monto.toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Vencimiento</p>
                                                    <p className={`text-base sm:text-lg font-semibold ${getDiasColor(gp.diasParaVencimiento, gp.estado)}`}>
                                                        {new Date(gp.fechaVencimiento).toLocaleDateString()}
                                                    </p>
                                                    <p className={`text-xs ${getDiasColor(gp.diasParaVencimiento, gp.estado)}`}>
                                                        {isFinalized ? (gp.fechaPago ? `Pagado ${new Date(gp.fechaPago).toLocaleDateString()}` : 'Cancelado') : getDiasLabel(gp.diasParaVencimiento)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Categoria</p>
                                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                        {gp.categoriaNombre || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Cuenta</p>
                                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                        {gp.cuentaNombre || 'Sin asignar'}
                                                    </p>
                                                </div>
                                                {gp.notas && (
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Notas</p>
                                                        <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            {gp.notas}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                                            {(gp.estado === 'Pendiente' || gp.estado === 'Vencido') && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenPagar(gp)}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                                                        title="Registrar pago"
                                                    >
                                                        <CreditCard size={16} />
                                                        <span className="sm:hidden lg:inline">Pagar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(gp)}
                                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelar(gp.id)}
                                                        className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                                        title="Cancelar gasto"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(gp.id)}
                                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Modal Crear/Editar */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
                            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {editingId ? 'Editar' : 'Nuevo'} gasto programado
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="gp-descripcion" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Descripcion
                                    </label>
                                    <input
                                        id="gp-descripcion"
                                        type="text"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        placeholder="Ej: Recibo de luz, Renta, Netflix..."
                                        className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : ''}`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gp-categoria" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Categoria
                                    </label>
                                    <select
                                        id="gp-categoria"
                                        value={formData.categoriaId}
                                        onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
                                        className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        required
                                    >
                                        <option value={0}>Seleccionar...</option>
                                        {categories.filter(c => c.tipo === 'Gasto').map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="gp-monto" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Monto
                                        </label>
                                        <input
                                            id="gp-monto"
                                            type="number"
                                            step="0.01"
                                            value={formData.monto || ''}
                                            onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                                            className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="gp-fecha" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Fecha Vencimiento
                                        </label>
                                        <input
                                            id="gp-fecha"
                                            type="date"
                                            value={formData.fechaVencimiento}
                                            onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="gp-cuenta" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Cuenta (Opcional)
                                    </label>
                                    <select
                                        id="gp-cuenta"
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
                                <div className="flex items-center gap-2">
                                    <input
                                        id="gp-variable"
                                        type="checkbox"
                                        checked={formData.esMontoVariable}
                                        onChange={(e) => setFormData({ ...formData, esMontoVariable: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="gp-variable" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                        Monto variable (recibos de luz, agua, gas, etc.)
                                    </label>
                                </div>
                                <div>
                                    <label htmlFor="gp-notas" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Notas (Opcional)
                                    </label>
                                    <textarea
                                        id="gp-notas"
                                        value={formData.notas || ''}
                                        onChange={(e) => setFormData({ ...formData, notas: e.target.value || null })}
                                        rows={2}
                                        className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : ''}`}
                                        placeholder="Numero de referencia, detalles adicionales..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                                        Guardar
                                    </button>
                                    <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Pagar */}
                {showPagarModal && pagandoGasto && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
                            <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Registrar pago
                            </h2>
                            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {pagandoGasto.descripcion}
                                {pagandoGasto.esMontoVariable && (
                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                        Monto variable
                                    </span>
                                )}
                            </p>

                            <form onSubmit={handlePagar} className="space-y-4">
                                <div>
                                    <label htmlFor="pagar-monto" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {pagandoGasto.esMontoVariable ? 'Monto real a pagar' : 'Monto'}
                                    </label>
                                    <input
                                        id="pagar-monto"
                                        type="number"
                                        step="0.01"
                                        value={pagarData.montoPagado ?? pagandoGasto.monto}
                                        onChange={(e) => setPagarData({ ...pagarData, montoPagado: parseFloat(e.target.value) || null })}
                                        className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        required
                                    />
                                    {pagandoGasto.esMontoVariable && (
                                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                            Monto estimado: ${pagandoGasto.monto.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="pagar-cuenta" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Cuenta de pago
                                    </label>
                                    <select
                                        id="pagar-cuenta"
                                        value={pagarData.cuentaId || pagandoGasto.cuentaId || ''}
                                        onChange={(e) => setPagarData({ ...pagarData, cuentaId: e.target.value ? Number(e.target.value) : null })}
                                        className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    >
                                        <option value="">Sin cuenta</option>
                                        {cuentas.map(cta => (
                                            <option key={cta.id} value={cta.id}>
                                                {cta.nombre} (${cta.balanceActual?.toFixed(2) ?? '0.00'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="pagar-fecha" className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Fecha de pago (por defecto hoy)
                                    </label>
                                    <input
                                        id="pagar-fecha"
                                        type="date"
                                        value={pagarData.fechaPago || ''}
                                        onChange={(e) => setPagarData({ ...pagarData, fechaPago: e.target.value || null })}
                                        className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">
                                        Confirmar Pago
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowPagarModal(false); setPagandoGasto(null); }}
                                        className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
                                    >
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
